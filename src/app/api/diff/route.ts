import { NextResponse } from 'next/server';
import { generateBeliefDiff } from '@/lib/temporal/belief-diff';
import { recordExecution } from '@/lib/swytchcode/telemetry';

/**
 * POST /api/diff
 * Compare Elon Musk's beliefs between two points in time with Swytchcode telemetry.
 */
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const { topic, date1, date2 } = await req.json();

    if (!topic || !date1 || !date2) {
      return NextResponse.json({ error: 'topic, date1, and date2 are required' }, { status: 400 });
    }

    const diff = await generateBeliefDiff(topic, date1, date2);

    // Record diff execution in Swytchcode telemetry
    await recordExecution({
      toolName: 'mindcommit.diff',
      input: { topic, date1, date2 },
      policyResult: { allowed: true, action: 'allow' },
      execution: {
        success: true,
        durationMs: Date.now() - startTime,
        retryCount: 0
      }
    });

    return NextResponse.json({ diff });
  } catch (error: any) {
    console.error('API /api/diff error:', error);

    await recordExecution({
      toolName: 'mindcommit.diff',
      input: { error: true },
      policyResult: { allowed: true, action: 'allow' },
      execution: {
        success: false,
        durationMs: Date.now() - startTime,
        retryCount: 0,
        error: error.message || 'Failed to generate diff'
      }
    }).catch(() => {});

    return NextResponse.json({ error: error.message || 'Failed to generate diff' }, { status: 500 });
  }
}
