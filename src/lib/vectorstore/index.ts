import { TemporalChunk } from '../types';
import { queryAsOf, queryLatest, addChunk } from '../temporal/temporal-index';

/**
 * Vector store interface abstracting the temporal index.
 */
export class VectorStore {
  /**
   * Add temporal chunks to the vector store
   */
  static async addChunks(chunks: TemporalChunk[]): Promise<void> {
    for (const chunk of chunks) {
      await addChunk(chunk);
    }
  }

  /**
   * Search vector store with temporal support and query text fallback
   */
  static async search(queryEmbedding: number[], topK: number = 5, asOfDate?: string, queryText: string = '') {
    if (asOfDate) {
      return queryAsOf(queryEmbedding, asOfDate, topK, queryText);
    }
    return queryLatest(queryEmbedding, topK, queryText);
  }
}
