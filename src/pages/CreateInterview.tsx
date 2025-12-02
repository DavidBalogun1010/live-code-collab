import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockAPI } from '@/lib/mockBackend';
import { toast } from 'sonner';

const CreateInterview: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !hostName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const interview = await mockAPI.createInterview(title.trim(), hostName.trim());
      toast.success('Interview created successfully!');
      navigate(`/interview/${interview.id}`, { 
        state: { participantId: interview.participants[0].id } 
      });
    } catch (error) {
      toast.error('Failed to create interview');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CodeCollab</h1>
            <p className="text-sm text-muted-foreground">Real-time Interview Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Start a New Interview
            </h2>
            <p className="text-muted-foreground">
              Create a collaborative coding session and invite candidates
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Interview Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Frontend Engineer - Technical Round"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hostName" className="text-foreground">
                Your Name
              </Label>
              <Input
                id="hostName"
                placeholder="e.g., John (Interviewer)"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 text-base"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Interview Room
                </>
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Real-time Collaboration</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <Code2 className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Multi-Language Support</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <Play className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Live Code Execution</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateInterview;
