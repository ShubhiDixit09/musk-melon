import fs from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { KnowledgeCommit } from '../types';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'commits.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load commits from JSON store
 */
async function loadCommits(): Promise<KnowledgeCommit[]> {
  try {
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist or is invalid
  }
}

/**
 * Save commits to JSON store
 */
async function saveCommits(commits: KnowledgeCommit[]): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(commits, null, 2), 'utf-8');
}

/**
 * Add a new commit to the store
 */
export async function addCommit(commit: KnowledgeCommit): Promise<void> {
  const commits = await loadCommits();
  commits.push(commit);
  await saveCommits(commits);
}

/**
 * Get a commit by ID
 */
export async function getCommit(id: string): Promise<KnowledgeCommit | undefined> {
  const commits = await loadCommits();
  return commits.find(c => c.id === id);
}

/**
 * Get all commits
 */
export async function getAllCommits(): Promise<KnowledgeCommit[]> {
  return loadCommits();
}

/**
 * Get commits within a specific date range
 */
export async function getCommitsByDateRange(from: string, to: string): Promise<KnowledgeCommit[]> {
  const commits = await loadCommits();
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  return commits.filter(c => {
    const t = new Date(c.timestamp).getTime();
    return t >= fromTime && t <= toTime;
  });
}

/**
 * Get commits by topic
 */
export async function getCommitsByTopic(topic: string): Promise<KnowledgeCommit[]> {
  const commits = await loadCommits();
  return commits.filter(c => c.topic.toLowerCase() === topic.toLowerCase());
}

/**
 * Get the full timeline of commits, sorted by timestamp
 */
export async function getCommitTimeline(): Promise<KnowledgeCommit[]> {
  const commits = await loadCommits();
  return commits.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Get store statistics
 */
export async function getStats(): Promise<{ total: number; topics: Record<string, number> }> {
  const commits = await loadCommits();
  const topics: Record<string, number> = {};
  for (const c of commits) {
    topics[c.topic] = (topics[c.topic] || 0) + 1;
  }
  return {
    total: commits.length,
    topics
  };
}

export const CommitStore = {
  addCommit,
  getCommit,
  getAllCommits,
  getCommitsByDateRange,
  getCommitsByTopic,
  getCommitTimeline,
  getStats
};
