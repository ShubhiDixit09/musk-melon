import { parse } from 'csv-parse/sync';

export interface Tweet {
  date: string;
  text: string;
  likes: number;
  retweets: number;
}

/**
 * Parse the Elon Musk tweets CSV.
 */
export function parseTweetCSV(csvContent: string): Tweet[] {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((record: any) => {
      // Flexible column detection
      const dateRaw = record.date || record.created_at || record.Time;
      const text = record.text || record.tweet || record.content || record.Tweet;
      const likesRaw = record.likes || record.favorite_count || 0;
      const retweetsRaw = record.retweets || record.retweet_count || 0;

      // Normalize date to ISO format
      let date = new Date().toISOString();
      if (dateRaw) {
        const parsedDate = new Date(dateRaw);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString();
        }
      }

      return {
        date,
        text: text || '',
        likes: parseInt(likesRaw, 10) || 0,
        retweets: parseInt(retweetsRaw, 10) || 0
      };
    }).filter((t: Tweet) => t.text.trim().length > 0 && !t.text.startsWith('RT @')); // Filter out pure retweets
  } catch (error) {
    console.error('Error parsing tweet CSV:', error);
    return [];
  }
}
