import { NextResponse } from 'next/server';
import { getAuditLog, getAuditStats } from '@/lib/swytchcode/telemetry';

/**
 * GET /api/swytchcode/audit
 * Returns execution audit trail and statistics.
 * Query params: ?tool=<name>&since=<ISO>&status=success|failure&limit=<n>&stats=true
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showStats = searchParams.get('stats') === 'true';
    const tool = searchParams.get('tool') || undefined;
    const since = searchParams.get('since') || undefined;
    const status = searchParams.get('status') as 'success' | 'failure' | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    if (showStats) {
      const stats = await getAuditStats();
      return NextResponse.json({ stats });
    }

    const entries = await getAuditLog({ toolName: tool, since, status, limit });

    return NextResponse.json({
      total: entries.length,
      entries
    });
  } catch (error: unknown) {
    console.error('Audit log error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit log' }, { status: 500 });
  }
}
