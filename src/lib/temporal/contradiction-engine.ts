import { OpenAI } from 'openai';
import { getCommitsByTopic } from '../commits/commit-store';

// Safe OpenAI initialization — does not crash if key is missing
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-') && !process.env.OPENAI_API_KEY.includes('...')) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Detect contradicting statements across time for a topic.
 * Falls back to a deterministic keyword-based detector if OpenAI is unavailable.
 */
export async function detectContradictions(topic: string) {
  const commits = await getCommitsByTopic(topic);
  if (commits.length < 2) {
    return { contradictions: [] };
  }

  const sorted = commits.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const historyText = sorted.map(c => `[${c.timestamp}] ${c.content}`).join('\n');

  if (openai) {
    try {
      const prompt = `Analyze the following statements made over time on the topic "${topic}".
Find any semantic contradictions or significant shifts in belief.
If there are contradictions, return them in JSON format as a list of objects with:
- statement1: The earlier statement
- date1: The date of the earlier statement
- statement2: The contradicting later statement
- date2: The date of the later statement

History:
${historyText}

Output strictly valid JSON with a "contradictions" array.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content || '{"contradictions":[]}';
      return JSON.parse(content);
    } catch (error) {
      console.warn('OpenAI contradiction detection failed, using fallback:', error);
    }
  }

  // Deterministic fallback: detect simple keyword-level contradictions
  const contradictions: { statement1: string; date1: string; statement2: string; date2: string }[] = [];
  const positivePairs = [
    ['support', 'oppose'], ['agree', 'disagree'], ['accept', 'reject'],
    ['buy', 'sell'], ['enable', 'disable'], ['allow', 'ban'],
    ['pro', 'anti'], ['believe', 'doubt']
  ];

  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const c1Lower = sorted[i].content.toLowerCase();
      const c2Lower = sorted[j].content.toLowerCase();
      for (const [pos, neg] of positivePairs) {
        if ((c1Lower.includes(pos) && c2Lower.includes(neg)) ||
            (c1Lower.includes(neg) && c2Lower.includes(pos))) {
          contradictions.push({
            statement1: sorted[i].content.substring(0, 200),
            date1: sorted[i].timestamp,
            statement2: sorted[j].content.substring(0, 200),
            date2: sorted[j].timestamp
          });
          break;
        }
      }
    }
  }

  return { contradictions: contradictions.slice(0, 5) };
}
