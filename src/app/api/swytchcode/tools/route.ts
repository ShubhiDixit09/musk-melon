import { NextResponse } from 'next/server';
import { getSwytchcodeTools } from '@/lib/swytchcode/tools';
import { evaluatePolicy } from '@/lib/swytchcode/middleware';
import { getToolingConfig } from '@/lib/swytchcode/config';

/**
 * GET /api/swytchcode/tools
 * Lists all registered Swytchcode tools with their schemas and policy status.
 */
export async function GET() {
  try {
    const tools = getSwytchcodeTools();
    const tooling = getToolingConfig();

    const toolList = tools.map(tool => {
      const policy = evaluatePolicy(tool.name);
      return {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        policy: {
          action: policy.action,
          ruleId: policy.ruleId,
          message: policy.message
        }
      };
    });

    return NextResponse.json({
      project: tooling.project,
      totalTools: toolList.length,
      tools: toolList
    });
  } catch (error: unknown) {
    console.error('Error listing Swytchcode tools:', error);
    return NextResponse.json({ error: 'Failed to list tools' }, { status: 500 });
  }
}
