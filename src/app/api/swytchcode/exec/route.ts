import { NextResponse } from 'next/server';
import { executeSwytchcodeTool } from '@/lib/swytchcode/tools';
import { evaluatePolicy } from '@/lib/swytchcode/middleware';

/**
 * POST /api/swytchcode/exec
 * Execute a Swytchcode tool via the full execution pipeline.
 * Body: { tool: string, input: Record<string, unknown> }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool, input } = body;

    if (!tool || typeof tool !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: "tool" (string)' },
        { status: 400 }
      );
    }

    if (input && typeof input !== 'object') {
      return NextResponse.json(
        { error: '"input" must be an object' },
        { status: 400 }
      );
    }

    // Pre-check policy before execution
    const policyCheck = evaluatePolicy(tool);

    const result = await executeSwytchcodeTool(tool, input || {});

    return NextResponse.json({
      tool,
      policy: {
        action: policyCheck.action,
        ruleId: policyCheck.ruleId,
        ...(policyCheck.message ? { message: policyCheck.message } : {})
      },
      result
    });
  } catch (error: unknown) {
    console.error('Swytchcode exec error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    );
  }
}
