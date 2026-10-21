import { NextResponse } from 'next/server';
import { getToolStatus } from '@/lib/swytchcode/tools';
import { getToolingConfig, getPoliciesConfig, getManifestConfig } from '@/lib/swytchcode/config';
import { getPolicySummary } from '@/lib/swytchcode/middleware';
import { getAuditStats } from '@/lib/swytchcode/telemetry';

/**
 * GET /api/swytchcode/status
 * Health check + full status of the Swytchcode execution layer.
 */
export async function GET() {
  try {
    const [toolStatus, auditStats] = await Promise.all([
      getToolStatus(),
      getAuditStats()
    ]);

    const tooling = getToolingConfig();
    const manifest = getManifestConfig();
    const policySummary = getPolicySummary();

    return NextResponse.json({
      status: toolStatus.cliAvailable ? 'connected' : 'cli_unavailable',
      project: tooling.project,
      version: tooling.version,
      environment: manifest.environment,
      cli: {
        available: toolStatus.cliAvailable,
        tokenConfigured: !!process.env.SWYTCHCODE_TOKEN
      },
      integrations: tooling.integrations.length,
      tools: toolStatus.tools,
      policies: policySummary,
      execution: {
        retries: manifest.execution.retries.maxAttempts,
        timeoutMs: manifest.execution.timeout.defaultMs,
        idempotency: manifest.execution.idempotency.enabled
      },
      audit: {
        totalExecutions: auditStats.totalExecutions,
        successRate: auditStats.totalExecutions > 0
          ? Math.round((auditStats.successCount / auditStats.totalExecutions) * 100)
          : 100,
        policyBlocks: auditStats.policyBlocks,
        avgLatencyMs: auditStats.avgDurationMs
      }
    });
  } catch (error: unknown) {
    console.error('Swytchcode status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Swytchcode status', status: 'error' },
      { status: 500 }
    );
  }
}
