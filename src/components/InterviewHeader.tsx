import React, { useState } from 'react';
import { Link2, Copy, Check, Play, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import { toast } from 'sonner';

interface InterviewHeaderProps {
  title: string;
  interviewId: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  onRunCode: () => void;
  onLeave: () => void;
  isRunning: boolean;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  title,
  interviewId,
  language,
  onLanguageChange,
  onRunCode,
  onLeave,
  isRunning,
}) => {
  const [copied, setCopied] = useState(false);
  
  const shareLink = `${window.location.origin}/interview/${interviewId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground font-mono">ID: {interviewId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px]">
              {shareLink}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyLink}
            >
              {copied ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>

          <LanguageSelector value={language} onChange={onLanguageChange} />

          <Button
            onClick={onRunCode}
            disabled={isRunning}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button
            variant="outline"
            onClick={onLeave}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>
    </header>
  );
};

export default InterviewHeader;
