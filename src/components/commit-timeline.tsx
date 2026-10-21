'use client';

const COLORS = {
  tesla: 'bg-red-500',
  spacex: 'bg-blue-500',
  ai: 'bg-purple-500',
  crypto: 'bg-yellow-500',
  politics: 'bg-orange-500',
  default: 'bg-[#f3951f]'
};

export function CommitTimeline() {
  // Mock data
  const commits = [
    { id: '1', date: '2023-11-20', topic: 'ai', source: 'Twitter', excerpt: 'xAI Grok is now available...' },
    { id: '2', date: '2023-10-15', topic: 'tesla', source: 'Earnings Call', excerpt: 'FSD V12 is entirely end-to-end AI...' },
    { id: '3', date: '2023-08-01', topic: 'spacex', source: 'Twitter', excerpt: 'Starship flight 2 preparation underway.' },
  ];

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-[#2a2926]">
      {commits.map((c) => (
        <div key={c.id} className="relative">
          <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ${COLORS[c.topic as keyof typeof COLORS] || COLORS.default} ring-4 ring-[#0a0a0a]`} />
          <div className="bg-[#141413] border border-[#1e1e1c] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-[#7a7974] uppercase tracking-wider">{c.topic} • {c.source}</span>
              <span className="text-xs text-[#7a7974]">{c.date}</span>
            </div>
            <p className="text-sm text-[#e8e6e1]">{c.excerpt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
