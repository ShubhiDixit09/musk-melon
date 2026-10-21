import { parseTweetCSV, Tweet } from './tweet-parser';

/**
 * Generic document parser supporting txt, md, csv, json.
 * Includes special handling for tweet CSV format.
 */
export async function parseDocument(content: string, type: string): Promise<string> {
  if (type === 'csv' || type === 'tweets') {
    const tweets = parseTweetCSV(content);
    return tweets.map((t: Tweet) => `[${t.date}] ${t.text}`).join('\n\n');
  }

  if (type === 'json') {
    try {
      const data = JSON.parse(content);
      return JSON.stringify(data, null, 2);
    } catch {
      return content;
    }
  }

  // txt, md
  return content.trim();
}
