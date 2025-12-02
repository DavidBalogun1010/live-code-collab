import React from 'react';
import { Terminal, AlertCircle, CheckCircle } from 'lucide-react';

interface OutputPanelProps {
  output: string;
  error: string | null;
  isRunning: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output, error, isRunning }) => {
  return (
    <div className="bg-card rounded-lg border border-border h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Output</h3>
        {isRunning && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Running...</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-auto font-mono text-sm">
        {error ? (
          <div className="flex items-start gap-2 text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <pre className="whitespace-pre-wrap break-words">{error}</pre>
          </div>
        ) : output ? (
          <div className="flex items-start gap-2 text-success">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <pre className="whitespace-pre-wrap break-words text-foreground">{output}</pre>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Click "Run Code" to execute your code and see the output here.
          </p>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
