// src/lib/swytchcode/middleware.ts
// Policy enforcement middleware — evaluates .swytchcode/policies.json rules before tool execution
import { getPoliciesConfig, PolicyRule } from './config';

interface PolicyEvaluation {
  allowed: boolean;
  action: 'allow' | 'deny' | 'require_approval' | 'rate_limit' | 'no_match';
  ruleId?: string;
  message?: string;
}

// In-memory rate limit tracker: key -> { count, windowStart }
const rateLimitState: Map<string, { count: number; windowStart: number }> = new Map();

function parseWindowMs(window: string): number {
  const match = window.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 3600000; // default 1h
  const value = parseInt(match[1]);
  switch (match[2]) {
    case 's': return value * 1000;
    case 'm': return value * 60000;
    case 'h': return value * 3600000;
    case 'd': return value * 86400000;
    default: return 3600000;
  }
}

function matchesToolPattern(pattern: string, toolName: string): boolean {
  if (pattern === toolName) return true;
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2);
    return toolName.startsWith(prefix + '.');
  }
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(2);
    return toolName.endsWith('.' + suffix) || toolName.includes('.' + suffix);
  }
  // Wildcard match for patterns like *.delete_*
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$');
  return regex.test(toolName);
}

function ruleMatchesTool(rule: PolicyRule, toolName: string): boolean {
  const conditions = Array.isArray(rule.condition.tool) ? rule.condition.tool : [rule.condition.tool];
  return conditions.some(pattern => matchesToolPattern(pattern, toolName));
}

/**
 * Evaluate Swytchcode policies against a tool name.
 * Rules are evaluated in order — first match wins.
 * Deny rules always take precedence over allow/approval rules.
 */
export function evaluatePolicy(toolName: string): PolicyEvaluation {
  const config = getPoliciesConfig();
  
  // Check deny rules first (highest priority)
  for (const rule of config.rules) {
    if (rule.action === 'deny' && ruleMatchesTool(rule, toolName)) {
      return {
        allowed: false,
        action: 'deny',
        ruleId: rule.id,
        message: rule.message || `Tool '${toolName}' is blocked by policy rule '${rule.id}'.`
      };
    }
  }

  // Check rate limits
  for (const rule of config.rules) {
    if (rule.action === 'rate_limit' && rule.limit && ruleMatchesTool(rule, toolName)) {
      const windowMs = parseWindowMs(rule.limit.window);
      const now = Date.now();
      const key = `rate:${rule.id}:${toolName}`;
      const state = rateLimitState.get(key);

      if (!state || (now - state.windowStart) > windowMs) {
        rateLimitState.set(key, { count: 1, windowStart: now });
      } else if (state.count >= rule.limit.max) {
        return {
          allowed: false,
          action: 'rate_limit',
          ruleId: rule.id,
          message: rule.message || `Tool '${toolName}' has exceeded the rate limit of ${rule.limit.max} calls per ${rule.limit.window}.`
        };
      } else {
        state.count++;
      }
    }
  }

  // Check require_approval rules
  for (const rule of config.rules) {
    if (rule.action === 'require_approval' && ruleMatchesTool(rule, toolName)) {
      return {
        allowed: true, // Allowed but flagged for approval
        action: 'require_approval',
        ruleId: rule.id,
        message: rule.message || `Tool '${toolName}' requires human approval before execution.`
      };
    }
  }

  // Check allow rules
  for (const rule of config.rules) {
    if (rule.action === 'allow' && ruleMatchesTool(rule, toolName)) {
      return {
        allowed: true,
        action: 'allow',
        ruleId: rule.id
      };
    }
  }

  // Default: allow if no matching rule (open policy)
  return {
    allowed: true,
    action: 'no_match'
  };
}

/** Get a summary of all policy rules */
export function getPolicySummary(): { total: number; allows: number; denies: number; approvals: number; rateLimits: number } {
  const config = getPoliciesConfig();
  return {
    total: config.rules.length,
    allows: config.rules.filter(r => r.action === 'allow').length,
    denies: config.rules.filter(r => r.action === 'deny').length,
    approvals: config.rules.filter(r => r.action === 'require_approval').length,
    rateLimits: config.rules.filter(r => r.action === 'rate_limit').length
  };
}

export type { PolicyEvaluation };
