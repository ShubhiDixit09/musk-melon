// src/lib/swytchcode/sync-engine.ts
// Swytchcode-powered source sync engine for approved Google Drive knowledge documents
import { createCommit } from '../commits/commit-engine';
import { addCommit } from '../commits/commit-store';
import { executeSwytchcodeTool } from './tools';
import { recordExecution } from './telemetry';
import { generateIdempotencyKey } from './retry';

/**
 * Swytchcode-powered sync engine.
 * All external API calls are routed through the Swytchcode execution pipeline:
 * Policy evaluation → Authentication → Retries → Idempotency → Telemetry
 */
export class SyncEngine {
  /**
   * Sync approved knowledge documents from Google Drive.
   * Flow: Swytchcode(googledrive.list_files) → Swytchcode(googledrive.download_file) → CommitEngine → CommitStore
   */
  static async syncGoogleDrive(query: string = "name contains 'Elon'"): Promise<{
    synced: number;
    commits: string[];
    errors: string[];
    policyBlocked: boolean;
  }> {
    const errors: string[] = [];
    const commits: string[] = [];

    // Step 1: List files (routed through Swytchcode execution pipeline)
    const listResult = await executeSwytchcodeTool('googledrive.list_files', { query });

    if (!listResult.success) {
      return {
        synced: 0,
        commits: [],
        errors: [listResult.error || 'Failed to list Google Drive files'],
        policyBlocked: listResult.error?.includes('Policy') || false
      };
    }

    if (!Array.isArray(listResult.data)) {
      return {
        synced: 0,
        commits: [],
        errors: ['Unexpected response format from googledrive.list_files'],
        policyBlocked: false
      };
    }

    // Step 2: Download each file and create knowledge commits
    for (const file of listResult.data as Array<{ id: string; name?: string; modifiedTime?: string }>) {
      try {
        const downloadResult = await executeSwytchcodeTool('googledrive.download_file', {
          fileId: file.id
        });

        if (downloadResult.success && typeof downloadResult.data === 'string') {
          const commit = createCommit(
            downloadResult.data,
            file.name || 'Google Drive Document',
            'document',
            file.modifiedTime || new Date().toISOString()
          );
          await addCommit(commit);
          commits.push(commit.id);
        } else {
          errors.push(`Failed to download file ${file.id}: ${downloadResult.error || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        errors.push(`Error processing file ${file.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      synced: commits.length,
      commits,
      errors,
      policyBlocked: false
    };
  }
}
