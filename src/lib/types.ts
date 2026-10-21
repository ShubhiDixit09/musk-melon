// Knowledge Commits
export interface KnowledgeCommit {
  id: string;
  timestamp: string; // ISO date when the knowledge was created
  ingestedAt: string; // ISO date when it was ingested into MindCommit
  source: string; // filename or URL
  sourceType: 'tweet' | 'article' | 'interview' | 'book' | 'document' | 'speech';
  topic: string; // auto-detected topic
  content: string;
  parentCommitId?: string;
  hash: string;
}

// Temporal Chunks
export interface TemporalChunk {
  id: string;
  content: string;
  embedding: number[];
  commitId: string;
  validFrom: string; // ISO date
  validTo?: string; // ISO date, undefined = still current
  metadata: {
    source: string;
    sourceType: string;
    topic: string;
    chunkIndex: number;
  };
}

export interface SearchResult {
  chunk: TemporalChunk;
  similarity: number;
}

// Answer Receipt
export interface AnswerReceipt {
  id: string;
  timestamp: string;
  query: string;
  mode: ChatMode;
  asOfDate?: string;
  sources: { commitId: string; source: string; date: string; excerpt: string }[];
  claimEvidence: { claim: string; evidence: string; confidence: number }[];
  contradictions: { statement1: string; date1: string; statement2: string; date2: string }[];
  groundingConfidence: number;
  isSynthesized: boolean;
  knowledgeVersion: string;
}

// Cognitive Signature
export interface CognitiveSignature {
  vocabulary: string[]; // characteristic words/phrases
  analogies: string[]; // recurring analogies
  reasoningStyle: string; // description
  communicationPatterns: string[];
}

// Chat
export type ChatMode = 'now' | 'time-lens' | 'belief-diff';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode?: ChatMode;
  receipt?: AnswerReceipt;
  confidence?: number;
}

export interface ChatRequest {
  message: string;
  mode: ChatMode;
  asOfDate?: string;
  compareDates?: { from: string; to: string };
  history: Message[];
}

export interface AgentResponse {
  message: string;
  receipt: AnswerReceipt;
  confidence: number;
}

// Belief Diff
export interface BeliefDiff {
  topic: string;
  period1: { date: string; position: string; sources: string[] };
  period2: { date: string; position: string; sources: string[] };
  whatChanged: string;
  whyChanged: string;
}

// Persona
export interface PersonaConfig {
  name: string;
  description: string;
  style: string;
  topics: string[];
  cognitiveSignature: CognitiveSignature;
}

// Swytchcode
export interface SwytchcodeTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Ingest
export interface IngestResult {
  commitsCreated: number;
  chunksCreated: number;
  sources: string[];
  timeRange: { earliest: string; latest: string };
}

export interface ConsentRecord {
  sourceId: string;
  sourceName: string;
  authorizedAt: string;
  authorizedBy: string;
  accessLevel: 'read' | 'write';
}

// Swytchcode Execution Pipeline
export interface SwytchcodeExecution {
  toolName: string;
  input: Record<string, unknown>;
  policyResult: {
    allowed: boolean;
    action: string;
    ruleId?: string;
    message?: string;
  };
  execution: {
    success: boolean;
    durationMs: number;
    retryCount: number;
    error?: string;
    idempotencyKey?: string;
  };
}

export interface SwytchcodeStatus {
  cliAvailable: boolean;
  environment: string;
  tools: { name: string; description: string; status: string; policyAction: string }[];
}

