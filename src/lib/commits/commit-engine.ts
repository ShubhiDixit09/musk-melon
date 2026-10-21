import crypto from 'node:crypto';
import { KnowledgeCommit } from '../types';

/**
 * Auto-detects topic from content using keyword matching.
 */
function detectTopic(content: string): string {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('tesla') || lowerContent.includes('model 3') || lowerContent.includes('ev')) return 'Tesla';
  if (lowerContent.includes('spacex') || lowerContent.includes('mars') || lowerContent.includes('falcon') || lowerContent.includes('starship')) return 'SpaceX';
  if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence') || lowerContent.includes('neural') || lowerContent.includes('xai')) return 'AI';
  if (lowerContent.includes('crypto') || lowerContent.includes('doge') || lowerContent.includes('bitcoin')) return 'Crypto';
  if (lowerContent.includes('twitter') || lowerContent.includes('x.com')) return 'Twitter/X';
  return 'General';
}

/**
 * Creates a timestamped Knowledge Commit.
 */
export function createCommit(
  content: string,
  source: string,
  sourceType: KnowledgeCommit['sourceType'],
  timestamp: string
): KnowledgeCommit {
  const id = crypto.randomUUID();
  const ingestedAt = new Date().toISOString();
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const topic = detectTopic(content);

  return {
    id,
    timestamp,
    ingestedAt,
    source,
    sourceType,
    topic,
    content,
    hash
  };
}

/**
 * Batch creates commits from tweet data.
 */
export function createCommitsFromTweets(tweets: { date: string; text: string }[]): KnowledgeCommit[] {
  return tweets.map(tweet => createCommit(tweet.text, 'tweets.csv', 'tweet', tweet.date));
}
