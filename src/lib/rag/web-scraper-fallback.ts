import { TemporalChunk } from '../types';
import { executeSwytchcodeTool } from '../swytchcode/tools';
import { WeaviateClient } from '../weaviate/weaviate-client';
import { addChunk } from '../temporal/temporal-index';

/**
 * Live Web Scraping & Discovery Fallback Engine
 * Uses Swytchcode's Firecrawl / Jina integrations and public web search endpoints
 * to pull fresh real-time information when vector DB has no matching chunks.
 */
export async function scrapeFreshWebContext(query: string): Promise<TemporalChunk[]> {
  console.log(`🌐 [WEB SCRAPER FALLBACK] Querying live web discovery for: "${query}"...`);
  const today = new Date().toISOString().split('T')[0];
  const chunks: TemporalChunk[] = [];

  // STEP 1: Attempt Swytchcode Firecrawl Tool Scrape
  try {
    const firecrawlResult = await executeSwytchcodeTool('firecrawl.scrape', {
      url: `https://x.com/search?q=${encodeURIComponent(query)}`,
      query
    });

    if (firecrawlResult.success && (firecrawlResult.data as any)?.content) {
      const scrapedText = (firecrawlResult.data as any).content;
      chunks.push({
        id: `web_fc_${Date.now()}`,
        content: scrapedText.substring(0, 800),
        embedding: [],
        commitId: `commit_web_${today}`,
        validFrom: today,
        metadata: {
          source: 'Live Web Scraping (Firecrawl)',
          sourceType: 'web',
          topic: 'breaking_news',
          chunkIndex: 0
        }
      });
    }
  } catch (err) {
    console.warn('Firecrawl tool call notice:', err);
  }

  // STEP 2: Live Web Search via DuckDuckGo / Wikipedia API
  if (chunks.length === 0) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('Elon Musk ' + query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (res.ok) {
        const html = await res.text();
        // Extract plain text snippet results
        const snippets: string[] = [];
        const regex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        while ((match = regex.exec(html)) !== null && snippets.length < 3) {
          const cleanText = match[1].replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").trim();
          if (cleanText.length > 40) {
            snippets.push(cleanText);
          }
        }

        if (snippets.length > 0) {
          snippets.forEach((snippet, i) => {
            chunks.push({
              id: `web_ddg_${Date.now()}_${i}`,
              content: `[Live Web Discovery] ${snippet}`,
              embedding: [],
              commitId: `commit_web_${today}`,
              validFrom: today,
              metadata: {
                source: `Live Web Search (${query.substring(0, 30)})`,
                sourceType: 'web',
                topic: 'live_web',
                chunkIndex: i
              }
            });
          });
        }
      }
    } catch (error) {
      console.warn('Live web search error:', error);
    }
  }

  // STEP 3: Fallback Wikipedia / Knowledge Summary
  if (chunks.length === 0) {
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent('Elon_Musk')}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.extract) {
          chunks.push({
            id: `web_wiki_${Date.now()}`,
            content: `[Wikipedia Public Record] ${wikiData.extract}`,
            embedding: [],
            commitId: `commit_web_${today}`,
            validFrom: today,
            metadata: {
              source: 'Wikipedia Verified Elon Musk Biography',
              sourceType: 'document',
              topic: 'biography',
              chunkIndex: 0
            }
          });
        }
      }
    } catch {}
  }

  // STEP 4: Ingest newly scraped chunks into Weaviate & Local Store for continuous learning
  if (chunks.length > 0) {
    console.log(`✅ [WEB SCRAPER SUCCESS] Scraped ${chunks.length} fresh intelligence chunks! Storing in Weaviate...`);
    try {
      for (const chunk of chunks) {
        await addChunk(chunk).catch(() => {});
      }
      await WeaviateClient.syncChunks(chunks).catch(() => {});
    } catch (e) {
      console.warn('Weaviate live sync notice:', e);
    }
  }

  return chunks;
}
