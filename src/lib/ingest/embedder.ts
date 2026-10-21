import { OpenAI } from 'openai';
import crypto from 'node:crypto';
import { KnowledgeCommit, TemporalChunk } from '../types';
import { chunkCommit } from './chunker';

// Safe OpenAI initialization — does not crash if key is missing
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-') && !process.env.OPENAI_API_KEY.includes('...')) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate a simple deterministic embedding fallback when OpenAI is unavailable.
 * Uses character-frequency hashing for basic semantic similarity.
 */
function generateFallbackEmbedding(text: string): number[] {
  const dim = 128;
  const embedding = new Array(dim).fill(0);
  const normalized = text.toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    const idx = normalized.charCodeAt(i) % dim;
    embedding[idx] += 1;
  }
  // L2 normalize
  const norm = Math.sqrt(embedding.reduce((s: number, v: number) => s + v * v, 0)) || 1;
  return embedding.map((v: number) => v / norm);
}

/**
 * Generate embeddings using text-embedding-3-small and create TemporalChunks.
 * Falls back to deterministic embedding if OpenAI is unavailable.
 */
export async function createTemporalChunks(commit: KnowledgeCommit): Promise<TemporalChunk[]> {
  const texts = chunkCommit(commit);
  if (texts.length === 0) return [];

  const BATCH_SIZE = 100;
  const allChunks: TemporalChunk[] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batchTexts = texts.slice(i, i + BATCH_SIZE);

    let embeddings: number[][] = [];

    if (openai) {
      try {
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batchTexts,
          encoding_format: 'float'
        });
        embeddings = response.data.map(d => d.embedding);
      } catch (error) {
        console.warn('OpenAI embeddings failed, using fallback:', error);
        embeddings = batchTexts.map(t => generateFallbackEmbedding(t));
      }
    } else {
      // No OpenAI key — use fallback embeddings
      embeddings = batchTexts.map(t => generateFallbackEmbedding(t));
    }

    batchTexts.forEach((text, index) => {
      allChunks.push({
        id: crypto.randomUUID(),
        content: text,
        embedding: embeddings[index] || [],
        commitId: commit.id,
        validFrom: commit.timestamp,
        validTo: undefined,
        metadata: {
          source: commit.source,
          sourceType: commit.sourceType,
          topic: commit.topic,
          chunkIndex: i + index
        }
      });
    });
  }

  return allChunks;
}
