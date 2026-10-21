// src/lib/swytchcode/config.ts
// Reads Swytchcode configuration from .swytchcode/ directory at runtime
import fs from 'node:fs';
import path from 'node:path';

const SWYTCHCODE_DIR = path.join(process.cwd(), '.swytchcode');

interface ToolingConfig {
  project: string;
  version: string;
  description: string;
  mode?: string;
  editor?: string;
  integrations: { name: string; description: string; tools: string[] }[];
}

interface PolicyRule {
  id: string;
  description: string;
  condition: { tool: string | string[]; method?: string[] };
  action: 'allow' | 'deny' | 'require_approval' | 'rate_limit';
  message?: string;
  limit?: { max: number; window: string };
}

interface PoliciesConfig {
  version: string;
  description?: string;
  rules: PolicyRule[];
}

interface ManifestConfig {
  project: string;
  version: string;
  environment: string;
  execution: {
    retries: { maxAttempts: number; backoffMs: number; maxBackoffMs: number; retryableStatusCodes: number[] };
    timeout: { defaultMs: number; maxMs: number };
    idempotency: { enabled: boolean; headerName: string };
  };
}

let _toolingCache: ToolingConfig | null = null;
let _policiesCache: PoliciesConfig | null = null;
let _manifestCache: ManifestConfig | null = null;

function readJsonFile<T>(filename: string): T | null {
  try {
    const filePath = path.join(SWYTCHCODE_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Swytchcode] Failed to read ${filename}:`, error);
    return null;
  }
}

/** Load tooling.json — defines which integrations and tools are enabled */
export function getToolingConfig(): ToolingConfig {
  if (!_toolingCache) {
    _toolingCache = readJsonFile<ToolingConfig>('tooling.json') || {
      project: 'muskmelon-knowledge-twin',
      version: '1.0.0',
      description: 'MindCommit — Version-Controlled Knowledge Twin',
      integrations: []
    };
  }
  return _toolingCache;
}

/** Load policies.json — defines guardrails for tool execution */
export function getPoliciesConfig(): PoliciesConfig {
  if (!_policiesCache) {
    _policiesCache = readJsonFile<PoliciesConfig>('policies.json') || {
      version: '1.0',
      rules: []
    };
  }
  return _policiesCache;
}

/** Load manifest.json — defines execution behavior (retries, timeouts, idempotency) */
export function getManifestConfig(): ManifestConfig {
  if (!_manifestCache) {
    _manifestCache = readJsonFile<ManifestConfig>('manifest.json') || {
      project: 'muskmelon-knowledge-twin',
      version: '1.0.0',
      environment: process.env.SWYTCHCODE_ENV || 'development',
      execution: {
        retries: { maxAttempts: 3, backoffMs: 1000, maxBackoffMs: 30000, retryableStatusCodes: [429, 500, 502, 503, 504] },
        timeout: { defaultMs: 30000, maxMs: 60000 },
        idempotency: { enabled: true, headerName: 'Idempotency-Key' }
      }
    };
  }
  return _manifestCache;
}

/** Get all enabled tool names from tooling.json */
export function getEnabledTools(): string[] {
  const config = getToolingConfig();
  return config.integrations.flatMap(i => i.tools);
}

/** Check if a tool is enabled in tooling.json */
export function isToolEnabled(toolName: string): boolean {
  const enabled = getEnabledTools();
  return enabled.some(t => t === toolName || toolName.startsWith(t.replace('.*', '.')));
}

/** Invalidate config caches (useful for hot-reload in development) */
export function invalidateConfigCaches(): void {
  _toolingCache = null;
  _policiesCache = null;
  _manifestCache = null;
}

export type { ToolingConfig, PoliciesConfig, PolicyRule, ManifestConfig };
