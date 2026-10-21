import { NextResponse } from 'next/server';
import { createCommit } from '@/lib/commits/commit-engine';
import { addCommit, getStats } from '@/lib/commits/commit-store';
import { parseDocument } from '@/lib/ingest/parser';
import { recordExecution } from '@/lib/swytchcode/telemetry';
import { KnowledgeCommit } from '@/lib/types';

/**
 * POST /api/ingest
 * Real document ingestion pipeline — processes uploaded files into Knowledge Commits.
 * Supports: .txt, .md, .csv, .json
 * Flow: Upload → Parse → Create Commits → Store → Telemetry
 */
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const formData = await req.formData();
    const files = formData.getAll('files');
    const sourceType = (formData.get('sourceType') as string) || 'document';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided. Use form field "files".' }, { status: 400 });
    }

    const createdCommits: KnowledgeCommit[] = [];
    const errors: string[] = [];

    for (const fileEntry of files) {
      if (!(fileEntry instanceof File)) {
        errors.push('Invalid file entry — expected File object');
        continue;
      }

      const file = fileEntry as File;
      const fileName = file.name;
      const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';

      try {
        const rawContent = await file.text();

        if (!rawContent.trim()) {
          errors.push(`File '${fileName}' is empty`);
          continue;
        }

        // Parse based on file type
        const parsedContent = await parseDocument(rawContent, ext);

        // Create Knowledge Commit
        const validSourceType = ['tweet', 'article', 'interview', 'book', 'document', 'speech'].includes(sourceType)
          ? sourceType as KnowledgeCommit['sourceType']
          : 'document';

        const commit = createCommit(
          parsedContent,
          fileName,
          validSourceType,
          new Date().toISOString()
        );

        await addCommit(commit);
        createdCommits.push(commit);
      } catch (fileError: unknown) {
        errors.push(`Failed to process '${fileName}': ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }

    // Get updated stats
    const stats = await getStats();

    // Record ingestion in Swytchcode telemetry
    await recordExecution({
      toolName: 'mindcommit.ingest',
      input: { fileCount: files.length, sourceType },
      policyResult: { allowed: true, action: 'allow' },
      execution: {
        success: createdCommits.length > 0,
        durationMs: Date.now() - startTime,
        retryCount: 0
      }
    });

    return NextResponse.json({
      success: createdCommits.length > 0,
      stats: {
        filesProcessed: files.length,
        commitsCreated: createdCommits.length,
        totalCommits: stats.total,
        topicsDetected: Object.keys(stats.topics),
        topicCounts: stats.topics
      },
      commits: createdCommits.map(c => ({
        id: c.id,
        source: c.source,
        topic: c.topic,
        timestamp: c.timestamp
      })),
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: unknown) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ingestion failed' },
      { status: 500 }
    );
  }
}
