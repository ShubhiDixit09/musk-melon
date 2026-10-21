import { NextResponse } from 'next/server';
import { executeEndToEndPipeline } from '@/lib/swytchcode/pipeline-engine';

/**
 * POST /api/pipeline
 * Triggers the full 7-phase Swytchcode end-to-end pipeline:
 * Discovery ──► Knowledge ──► Weaviate RAG ──► LLM ──► Policy Gate ──► Distribution ──► Telemetry
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, options = {} } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const result = await executeEndToEndPipeline(query, options);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Pipeline error:', error);
    return NextResponse.json({ error: error.message || 'Pipeline execution failed' }, { status: 500 });
  }
}
