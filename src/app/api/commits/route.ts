import { NextResponse } from 'next/server';
import { CommitStore } from '@/lib/commits/commit-store';
import { recordExecution } from '@/lib/swytchcode/telemetry';

/**
 * GET /api/commits
 * Retrieve Knowledge Commits timeline with Swytchcode telemetry.
 */
export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const topic = searchParams.get('topic');

    let commits;

    if (from && to) {
      commits = await CommitStore.getCommitsByDateRange(from, to);
    } else if (topic) {
      commits = await CommitStore.getCommitsByTopic(topic);
    } else {
      commits = await CommitStore.getAllCommits();
    }

    const stats = await CommitStore.getStats();

    // Record commits query execution in Swytchcode telemetry
    await recordExecution({
      toolName: 'mindcommit.commits_query',
      input: { from, to, topic, totalCommits: commits.length },
      policyResult: { allowed: true, action: 'allow' },
      execution: {
        success: true,
        durationMs: Date.now() - startTime,
        retryCount: 0
      }
    });

    return NextResponse.json({
      commits,
      stats,
      total: commits.length
    });
  } catch (error: any) {
    console.error('API /api/commits error:', error);

    await recordExecution({
      toolName: 'mindcommit.commits_query',
      input: { error: true },
      policyResult: { allowed: true, action: 'allow' },
      execution: {
        success: false,
        durationMs: Date.now() - startTime,
        retryCount: 0,
        error: error.message || 'Failed to fetch commits'
      }
    }).catch(() => {});

    return NextResponse.json({ error: error.message || 'Failed to fetch commits' }, { status: 500 });
  }
}
