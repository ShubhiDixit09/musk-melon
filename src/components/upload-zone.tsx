'use client';
import { useState, useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    // Mock upload progress
    setProgress(10);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 500);
  }, []);

  return (
    <div className="w-full">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-200",
          isDragging ? "border-[#f3951f] bg-[#f3951f]/5" : "border-[#2a2926] bg-[#141413]"
        )}
      >
        <Upload className="mx-auto mb-4 text-[#7a7974]" size={32} />
        <h3 className="text-lg font-medium text-[#e8e6e1] mb-2">Drop files to ingest</h3>
        <p className="text-sm text-[#7a7974]">Supports .csv (tweets), .txt, .md, .json</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-[#1a1a18] border border-[#2a2926] rounded-xl">
              <FileText size={16} className={f.name.endsWith('.csv') ? "text-green-500" : "text-[#f3951f]"} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#e8e6e1] truncate">{f.name}</div>
                <div className="text-xs text-[#7a7974]">{(f.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          ))}
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-[#1a1a18] rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-[#f3951f] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
