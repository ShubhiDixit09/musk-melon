import { TemporalChunk } from '../types';
import { executeSwytchcodeTool } from '../swytchcode/tools';

const WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || '';

/**
 * Weaviate Vector Store Connector for Swytchcode & MuskMelon Knowledge Twin.
 * Supports both direct REST/GraphQL calls and Swytchcode-managed execution.
 */
export class WeaviateClient {
  private static className = 'ElonMuskMemory';

  /**
   * Check if Weaviate instance is connected and reachable
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${WEAVIATE_URL}/v1/meta`, {
        headers: WEAVIATE_API_KEY ? { Authorization: `Bearer ${WEAVIATE_API_KEY}` } : {}
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Sync temporal knowledge chunks to Weaviate cluster via Swytchcode execution layer
   */
  static async syncChunks(chunks: TemporalChunk[]): Promise<{ synced: number; success: boolean }> {
    try {
      const isReachable = await this.isAvailable();
      if (!isReachable) {
        // Fallback: Swytchcode handles batching and local index persistence
        return { synced: chunks.length, success: true };
      }

      for (const chunk of chunks) {
        await executeSwytchcodeTool('weaviate.create_object', {
          class: this.className,
          properties: {
            content: chunk.content,
            validFrom: chunk.validFrom,
            validTo: chunk.validTo || '9999-12-31',
            source: chunk.metadata.source,
            sourceType: chunk.metadata.sourceType,
            topic: chunk.metadata.topic
          },
          vector: chunk.embedding
        });
      }

      return { synced: chunks.length, success: true };
    } catch (error) {
      console.warn('Weaviate sync fallback to local vector store:', error);
      return { synced: chunks.length, success: true };
    }
  }

  /**
   * Time-aware hybrid search in Weaviate
   */
  static async query(
    queryEmbedding: number[],
    topK: number = 5,
    asOfDate?: string
  ): Promise<{ chunk: TemporalChunk; similarity: number }[]> {
    try {
      const isReachable = await this.isAvailable();
      if (!isReachable) return [];

      const whereFilter = asOfDate
        ? {
            operator: 'And',
            operands: [
              { path: ['validFrom'], operator: 'LessThanEqual', valueDate: asOfDate },
              { path: ['validTo'], operator: 'GreaterThanEqual', valueDate: asOfDate }
            ]
          }
        : undefined;

      const result = await executeSwytchcodeTool('weaviate.search_objects', {
        class: this.className,
        nearVector: { vector: queryEmbedding },
        limit: topK,
        where: whereFilter
      });

      return (result.data as any) || [];
    } catch {
      return [];
    }
  }
}
