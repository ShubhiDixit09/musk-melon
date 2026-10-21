import { NextResponse } from 'next/server';
import { SyncEngine } from '@/lib/swytchcode/sync-engine';

/**
 * POST /api/sync
 * Trigger Google Drive knowledge sync via Swytchcode execution pipeline.
 * Body: { query?: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || "name contains 'Elon'";

    const result = await SyncEngine.syncGoogleDrive(query);

    return NextResponse.json({
      success: result.synced > 0,
      synced: result.synced,
      commits: result.commits,
      errors: result.errors,
      policyBlocked: result.policyBlocked
    });
  } catch (error: unknown) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
