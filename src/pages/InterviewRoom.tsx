import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import InterviewHeader from '@/components/InterviewHeader';
import CodeEditor from '@/components/CodeEditor';
import OutputPanel from '@/components/OutputPanel';
import ParticipantsList from '@/components/ParticipantsList';
import { mockAPI, executeCode, Interview, preloadPython, isPyodideLoaded } from '@/lib/mockBackend';
import { toast } from 'sonner';

const InterviewRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const participantId = location.state?.participantId || '';
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load interview data
  useEffect(() => {
    const loadInterview = async () => {
      if (!id) return;
      
      const data = await mockAPI.getInterview(id);
      if (data) {
        setInterview(data);
        setCode(data.code);
      } else {
        toast.error('Interview not found');
        navigate('/');
      }
      setIsLoading(false);
    };

    loadInterview();
  }, [id, navigate]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    const unsubscribe = mockAPI.subscribe(id, (updatedInterview) => {
      setInterview(updatedInterview);
      // Only update code if it changed from another user
      // This prevents cursor jumping while typing
      setCode(prev => {
        if (prev !== updatedInterview.code) {
          return updatedInterview.code;
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [id]);

  // Handle code changes
  const handleCodeChange = useCallback(async (newCode: string) => {
    setCode(newCode);
    if (id) {
      await mockAPI.updateCode(id, newCode);
    }
  }, [id]);

  // Handle language changes
  const handleLanguageChange = useCallback(async (newLanguage: string) => {
    if (id) {
      await mockAPI.updateLanguage(id, newLanguage);
      
      // Preload Python runtime when selected
      if (newLanguage === 'python' && !isPyodideLoaded()) {
        toast.info('Loading Python runtime...', { duration: 2000 });
        preloadPython().then(() => {
          toast.success('Python ready!', { duration: 1500 });
        }).catch(() => {
          toast.error('Failed to load Python runtime');
        });
      }
    }
  }, [id]);

  // Run code
  const handleRunCode = async () => {
    if (!interview) return;
    
    setIsRunning(true);
    setOutput('');
    setError(null);

    // Show loading message for Python if runtime not ready
    if (interview.language === 'python' && !isPyodideLoaded()) {
      setOutput('Loading Python runtime (first run may take a few seconds)...');
    }

    try {
      const result = await executeCode(code, interview.language);
      setOutput(result.output);
      setError(result.error);
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  // Leave interview
  const handleLeave = async () => {
    if (id && participantId) {
      await mockAPI.leaveInterview(id, participantId);
    }
    toast.info('You left the interview');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview room...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <InterviewHeader
        title={interview.title}
        interviewId={interview.id}
        language={interview.language}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        onLeave={handleLeave}
        isRunning={isRunning}
      />

      <main className="flex-1 flex p-4 gap-4 overflow-hidden">
        {/* Code Editor - Main Area */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={code}
              language={interview.language}
              onChange={handleCodeChange}
            />
          </div>
          
          {/* Output Panel */}
          <div className="h-48">
            <OutputPanel
              output={output}
              error={error}
              isRunning={isRunning}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0">
          <ParticipantsList
            participants={interview.participants}
            currentUserId={participantId}
          />
        </div>
      </main>
    </div>
  );
};

export default InterviewRoom;
