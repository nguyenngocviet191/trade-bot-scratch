import { useEffect, useRef } from 'react';

interface Log {
  type: string;
  message: string;
  timestamp: string;
}

interface LogDisplayProps {
  logs: Log[];
}

export function LogDisplay({ logs }: LogDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={containerRef}
      className="bg-card text-card-foreground p-4 rounded-md h-[300px] overflow-y-auto"
    >
      <h3 className="text-lg font-semibold mb-2">Interaction Logs</h3>
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="text-sm border-l-2 border-primary pl-2">
            <span className="text-muted-foreground">{log.timestamp}</span>
            <span className="mx-2 text-primary">{log.type}</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
