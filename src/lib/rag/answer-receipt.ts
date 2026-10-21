import crypto from 'node:crypto';
import { AnswerReceipt, ChatMode, TemporalChunk } from '../types';

/**
 * Generate an Answer Receipt for a response.
 * Maps claims to evidence and calculates confidence.
 */
export async function generateAnswerReceipt(
  query: string,
  answer: string,
  contextChunks: TemporalChunk[],
  mode: ChatMode,
  asOfDate?: string
): Promise<AnswerReceipt> {
  // In a full implementation, we'd use an LLM here to extract claims and verify grounding.
  // For now, we mock the evidence mapping based on the context chunks.

  const sources = contextChunks.map(c => ({
    commitId: c.commitId,
    source: c.metadata.source,
    date: c.validFrom,
    excerpt: c.content.substring(0, 100) + '...'
  }));

  const claimEvidence = contextChunks.slice(0, 2).map(c => ({
    claim: "Statement backed by context",
    evidence: c.content.substring(0, 150),
    confidence: 0.95
  }));

  const isSynthesized = claimEvidence.length === 0;
  const groundingConfidence = isSynthesized ? 0.0 : 0.95;

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    query,
    mode,
    asOfDate,
    sources,
    claimEvidence,
    contradictions: [], // Contradictions handled by contradiction-engine
    groundingConfidence,
    isSynthesized,
    knowledgeVersion: '1.0'
  };
}
