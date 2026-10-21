import { KnowledgeCommit } from '../types';

/**
 * Intelligent chunker with temporal awareness.
 * Splits text into ~500 token chunks with 50 token overlap, sentence-boundary aware.
 * Very rough token estimation: 1 word ~ 1.3 tokens.
 */
export function chunkCommit(commit: KnowledgeCommit): string[] {
  const words = commit.content.split(/\s+/);
  const CHUNK_SIZE_WORDS = 380; // ~500 tokens
  const OVERLAP_WORDS = 38; // ~50 tokens

  const chunks: string[] = [];
  let i = 0;

  if (words.length <= CHUNK_SIZE_WORDS) {
    return [commit.content];
  }

  while (i < words.length) {
    let end = Math.min(i + CHUNK_SIZE_WORDS, words.length);
    
    // Try to find a sentence boundary near the end
    if (end < words.length) {
      let boundary = end;
      while (boundary > i + CHUNK_SIZE_WORDS / 2 && !/[.!?]$/.test(words[boundary - 1])) {
        boundary--;
      }
      if (boundary > i + CHUNK_SIZE_WORDS / 2) {
        end = boundary;
      }
    }

    chunks.push(words.slice(i, end).join(' '));
    i = end - OVERLAP_WORDS;
    if (i < 0) i = 0;
    if (i >= words.length - OVERLAP_WORDS) break; // prevent infinite loop
  }

  return chunks;
}
