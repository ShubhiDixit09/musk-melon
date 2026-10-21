// src/lib/swytchcode/tools.ts
// Swytchcode tool execution layer — routes ALL external API calls through the execution pipeline
import { SwytchcodeTool, ToolResult } from '../types';
import { getToolingConfig, getManifestConfig } from './config';
import { evaluatePolicy } from './middleware';
import { recordExecution } from './telemetry';
import { withRetry, generateIdempotencyKey } from './retry';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Standard Swytchcode exit codes
const EXIT_CODES: Record<number, string> = {
  0: 'Successful execution',
  1: 'Execution failed',
  2: 'Invalid input',
  3: 'Authentication failed',
  4: 'Blocked by policy',
  5: 'Tool not found'
};

/** Check if Swytchcode CLI is accessible */
async function isSwytchcodeAvailable(): Promise<boolean> {
  try {
    // Try platform-specific command
    const cmd = process.platform === 'win32' ? 'swy.cmd --version' : 'swy --version';
    await execAsync(cmd, { timeout: 5000 });
    return true;
  } catch {
    try {
      await execAsync('npx swytchcode --version', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }
}

let _cliAvailable: boolean | null = null;

/** Cached CLI availability check */
async function checkCLIAvailability(): Promise<boolean> {
  if (_cliAvailable === null) {
    _cliAvailable = await isSwytchcodeAvailable();
  }
  return _cliAvailable;
}

/**
 * Execute a Swytchcode tool through the full execution pipeline:
 * 1. Policy evaluation (from .swytchcode/policies.json)
 * 2. Input validation
 * 3. Idempotency key generation (for mutating ops)
 * 4. Execution with retry + exponential backoff
 * 5. Telemetry recording
 */
export async function executeSwytchcodeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  const startTime = Date.now();
  let retryCount = 0;

  // Step 1: Policy evaluation
  const policyResult = evaluatePolicy(toolName);

  if (!policyResult.allowed) {
    // Record blocked execution in telemetry
    await recordExecution({
      toolName,
      input: sanitizeInput(input),
      policyResult,
      execution: {
        success: false,
        durationMs: Date.now() - startTime,
        retryCount: 0,
        error: policyResult.message
      }
    });

    return {
      success: false,
      error: `[Policy: ${policyResult.ruleId}] ${policyResult.message}`
    };
  }

  // Step 2: Generate idempotency key for mutating operations
  const isMutating = toolName.includes('send') || toolName.includes('post') || toolName.includes('create') || toolName.includes('delete') || toolName.includes('update');
  const idempotencyKey = isMutating ? generateIdempotencyKey(toolName, input) : undefined;

  // Step 3: Execute with retries
  try {
    const cliAvailable = await checkCLIAvailability();

    if (!cliAvailable) {
      const result: ToolResult = {
        success: false,
        error: `Swytchcode CLI not available. Install with 'npm install -g swytchcode' and run 'swy login'. Tool '${toolName}' execution deferred.`
      };

      await recordExecution({
        toolName,
        input: sanitizeInput(input),
        policyResult,
        execution: {
          success: false,
          durationMs: Date.now() - startTime,
          retryCount: 0,
          error: result.error,
          idempotencyKey
        }
      });

      return result;
    }

    const { result, attempts } = await withRetry(async () => {
      retryCount++;
      return await executeCLI(toolName, input, idempotencyKey);
    });

    // Step 4: Record successful execution
    await recordExecution({
      toolName,
      input: sanitizeInput(input),
      policyResult,
      execution: {
        success: result.success,
        durationMs: Date.now() - startTime,
        retryCount: attempts - 1,
        error: result.error,
        idempotencyKey
      }
    });

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';

    await recordExecution({
      toolName,
      input: sanitizeInput(input),
      policyResult,
      execution: {
        success: false,
        durationMs: Date.now() - startTime,
        retryCount,
        error: errorMessage,
        idempotencyKey
      }
    });

    return {
      success: false,
      error: `Swytchcode execution failed after ${retryCount} attempts: ${errorMessage}`
    };
  }
}

/** Execute via Swytchcode CLI with proper escaping and timeout */
async function executeCLI(
  toolName: string,
  input: Record<string, unknown>,
  idempotencyKey?: string
): Promise<ToolResult> {
  const inputJson = JSON.stringify(input);
  const manifest = getManifestConfig();
  const swyCmd = process.platform === 'win32' ? 'swy.cmd' : 'swy';

  // Build command with proper escaping for the platform
  let cmd: string;
  if (process.platform === 'win32') {
    // Windows: use single quotes inside, escape for cmd.exe
    const escapedJson = inputJson.replace(/"/g, '\\"');
    cmd = `${swyCmd} exec ${toolName} "${escapedJson}"`;
  } else {
    // Unix: use single quotes for the JSON argument
    cmd = `${swyCmd} exec ${toolName} '${inputJson}'`;
  }

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: manifest.execution.timeout.defaultMs,
      env: {
        ...process.env,
        SWYTCHCODE_TOKEN: process.env.SWYTCHCODE_TOKEN || '',
        ...(idempotencyKey ? { SWYTCHCODE_IDEMPOTENCY_KEY: idempotencyKey } : {})
      }
    });

    if (stderr && !stdout) {
      return { success: false, error: stderr.trim() };
    }

    try {
      const parsed = JSON.parse(stdout);
      return { success: true, data: parsed };
    } catch {
      return { success: true, data: stdout.trim() };
    }
  } catch (error: unknown) {
    const execError = error as { code?: number; message?: string };
    const exitCode = execError.code || 1;
    const exitMessage = EXIT_CODES[exitCode] || 'Unknown error';
    return {
      success: false,
      error: `[Exit ${exitCode}: ${exitMessage}] ${execError.message || 'CLI execution failed'}`
    };
  }
}

/** Sanitize input for audit logging (remove sensitive fields) */
function sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...input };
  const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apiKey', 'authorization'];
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

/**
 * Get all registered Swytchcode tools with their schemas and policy status.
 * These define the execution boundary for the MindCommit Knowledge Twin.
 */
export function getSwytchcodeTools(): SwytchcodeTool[] {
  return [
    // === Knowledge Ingestion (Discovery) ===
    {
      name: 'googledrive.list_files',
      description: 'List approved documents in Google Drive for knowledge ingestion. [Policy: allow]',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query filter for Google Drive files' }
        }
      },
      execute: async (input) => executeSwytchcodeTool('googledrive.list_files', input)
    },
    {
      name: 'googledrive.download_file',
      description: 'Download file content from Google Drive for vectorization and commit creation. [Policy: allow]',
      inputSchema: {
        type: 'object',
        properties: {
          fileId: { type: 'string', description: 'Google Drive file ID to download' }
        },
        required: ['fileId']
      },
      execute: async (input) => executeSwytchcodeTool('googledrive.download_file', input)
    },
    // === Communication (Distribution) ===
    {
      name: 'telegram.send_message',
      description: 'Send grounded answer receipt to verified Telegram subscriber. [Policy: require_approval + rate_limit]',
      inputSchema: {
        type: 'object',
        properties: {
          chat_id: { type: 'string', description: 'Telegram chat ID' },
          text: { type: 'string', description: 'Message content to send' }
        },
        required: ['chat_id', 'text']
      },
      execute: async (input) => executeSwytchcodeTool('telegram.send_message', input)
    },
    {
      name: 'slack.post_message',
      description: 'Post verified knowledge response to Slack workspace channel. [Policy: require_approval + rate_limit]',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Slack channel name or ID' },
          text: { type: 'string', description: 'Message content to post' }
        },
        required: ['channel', 'text']
      },
      execute: async (input) => executeSwytchcodeTool('slack.post_message', input)
    },
    {
      name: 'gmail.send_email',
      description: 'Send Answer Receipt email via Gmail. [Policy: require_approval + rate_limit]',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject line' },
          body: { type: 'string', description: 'Email body content' }
        },
        required: ['to', 'subject', 'body']
      },
      execute: async (input) => executeSwytchcodeTool('gmail.send_email', input)
    },
    {
      name: 'resend.send_email',
      description: 'Send transactional Answer Receipt email via Resend. [Policy: require_approval + rate_limit]',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email' },
          subject: { type: 'string', description: 'Subject line' },
          html: { type: 'string', description: 'HTML email body' }
        },
        required: ['to', 'subject', 'html']
      },
      execute: async (input) => executeSwytchcodeTool('resend.send_email', input)
    }
  ];
}

/** Get status of all configured tools */
export async function getToolStatus(): Promise<{
  cliAvailable: boolean;
  environment: string;
  tools: { name: string; description: string; status: string; policyAction: string }[];
}> {
  const cliAvailable = await checkCLIAvailability();
  const manifest = getManifestConfig();

  const tools = getSwytchcodeTools().map(tool => {
    const policy = evaluatePolicy(tool.name);
    return {
      name: tool.name,
      description: tool.description,
      status: cliAvailable ? 'connected' : 'cli_unavailable',
      policyAction: policy.action
    };
  });

  return {
    cliAvailable,
    environment: manifest.environment,
    tools
  };
}
