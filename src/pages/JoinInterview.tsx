import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Code2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockAPI } from '@/lib/mockBackend';
import { toast } from 'sonner';

const JoinInterview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [interviewExists, setInterviewExists] = useState<boolean | null>(null);
  const [interviewTitle, setInterviewTitle] = useState('');

  useEffect(() => {
    const checkInterview = async () => {
      if (!id) return;
      const interview = await mockAPI.getInterview(id);
      if (interview) {
        setInterviewExists(true);
        setInterviewTitle(interview.title);
      } else {
        setInterviewExists(false);
      }
    };
    checkInterview();
  }, [id]);

  const handleJoin = async () => {
    if (!name.trim() || !id) {
      toast.error('Please enter your name');
      return;
    }

    setIsJoining(true);
    try {
      const participant = await mockAPI.joinInterview(id, name.trim());
      if (participant) {
        toast.success('Joined interview successfully!');
        navigate(`/interview/${id}`, { 
          state: { participantId: participant.id } 
        });
      } else {
        toast.error('Interview not found');
      }
    } catch (error) {
      toast.error('Failed to join interview');
    } finally {
      setIsJoining(false);
    }
  };

  if (interviewExists === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (interviewExists === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="text-center animate-fade-in">
          <Code2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Interview Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This interview room doesn't exist or has been closed.
          </p>
          <Button onClick={() => navigate('/')} className="bg-primary text-primary-foreground">
            Create New Interview
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Join Interview
            </h2>
            <p className="text-muted-foreground">
              You're joining: <span className="text-primary font-medium">{interviewTitle}</span>
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Your Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Alex (Candidate)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 text-base"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Interview
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JoinInterview;
