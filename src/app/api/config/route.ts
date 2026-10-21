import { NextResponse } from 'next/server';

// Mock in-memory config
let currentConfig = {
  name: 'Vibe Bot',
  description: 'An expert assistant cloned from personal knowledge.',
  style: 'Professional, concise, and helpful.',
  topics: 'technology, coding, general knowledge'
};

export async function GET() {
  return NextResponse.json({
    config: currentConfig,
    stats: {
      totalDocuments: 24,
      totalChunks: 1204,
      lastIngestion: new Date().toISOString()
    }
  });
}

export async function POST(req: Request) {
  try {
    const newConfig = await req.json();
    currentConfig = { ...currentConfig, ...newConfig };
    
    return NextResponse.json({ success: true, config: currentConfig });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
