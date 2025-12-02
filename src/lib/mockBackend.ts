// Mock Express.js Backend Simulation
// This simulates backend behavior for the interview platform

import { v4 as uuidv4 } from 'uuid';

export interface Interview {
  id: string;
  createdAt: Date;
  title: string;
  code: string;
  language: string;
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  joinedAt: Date;
}

// In-memory storage (simulates database)
const interviews = new Map<string, Interview>();
const subscribers = new Map<string, Set<(data: Interview) => void>>();

// Generate a random color for participant
const generateColor = (): string => {
  const colors = [
    '#22d3ee', '#a78bfa', '#f472b6', '#4ade80', 
    '#fbbf24', '#f87171', '#60a5fa', '#34d399'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Mock API endpoints (simulating Express.js routes)
export const mockAPI = {
  // POST /api/interviews - Create new interview
  createInterview: async (title: string, hostName: string): Promise<Interview> => {
    const interview: Interview = {
      id: uuidv4().slice(0, 8),
      createdAt: new Date(),
      title,
      code: '// Welcome to the interview!\n// Start coding here...\n\nfunction solution() {\n  // Your code here\n}\n',
      language: 'javascript',
      participants: [{
        id: uuidv4(),
        name: hostName,
        color: '#22d3ee',
        isHost: true,
        joinedAt: new Date(),
      }],
    };
    
    interviews.set(interview.id, interview);
    return interview;
  },

  // GET /api/interviews/:id - Get interview by ID
  getInterview: async (id: string): Promise<Interview | null> => {
    return interviews.get(id) || null;
  },

  // POST /api/interviews/:id/join - Join an interview
  joinInterview: async (id: string, name: string): Promise<Participant | null> => {
    const interview = interviews.get(id);
    if (!interview) return null;

    const participant: Participant = {
      id: uuidv4(),
      name,
      color: generateColor(),
      isHost: false,
      joinedAt: new Date(),
    };

    interview.participants.push(participant);
    notifySubscribers(id);
    return participant;
  },

  // POST /api/interviews/:id/leave - Leave an interview
  leaveInterview: async (id: string, participantId: string): Promise<boolean> => {
    const interview = interviews.get(id);
    if (!interview) return false;

    interview.participants = interview.participants.filter(p => p.id !== participantId);
    notifySubscribers(id);
    return true;
  },

  // PUT /api/interviews/:id/code - Update code (real-time simulation)
  updateCode: async (id: string, code: string): Promise<boolean> => {
    const interview = interviews.get(id);
    if (!interview) return false;

    interview.code = code;
    notifySubscribers(id);
    return true;
  },

  // PUT /api/interviews/:id/language - Update language
  updateLanguage: async (id: string, language: string): Promise<boolean> => {
    const interview = interviews.get(id);
    if (!interview) return false;

    interview.language = language;
    notifySubscribers(id);
    return true;
  },

  // WebSocket simulation - Subscribe to interview updates
  subscribe: (id: string, callback: (data: Interview) => void): (() => void) => {
    if (!subscribers.has(id)) {
      subscribers.set(id, new Set());
    }
    subscribers.get(id)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = subscribers.get(id);
      if (subs) {
        subs.delete(callback);
      }
    };
  },
};

// Notify all subscribers of an interview update
const notifySubscribers = (id: string) => {
  const interview = interviews.get(id);
  const subs = subscribers.get(id);
  
  if (interview && subs) {
    subs.forEach(callback => callback(interview));
  }
};

// Strip TypeScript types for browser execution
const stripTypeScriptTypes = (code: string): string => {
  return code
    // Remove type annotations from variables and parameters
    .replace(/:\s*[A-Za-z<>\[\]|&\s,{}]+(?=\s*[=,)\];{}])/g, '')
    // Remove interface declarations
    .replace(/interface\s+\w+\s*{[^}]*}/g, '')
    // Remove type declarations
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    // Remove generic type parameters
    .replace(/<[A-Za-z,\s]+>/g, '')
    // Remove 'as' type assertions
    .replace(/\s+as\s+\w+/g, '')
    // Remove export/import type statements
    .replace(/(?:export|import)\s+type\s+[^;]+;/g, '')
    // Remove access modifiers
    .replace(/\b(public|private|protected|readonly)\s+/g, '');
};

// Safe code execution in browser sandbox
export const executeCode = async (code: string, language: string): Promise<{ output: string; error: string | null }> => {
  const supportedLanguages = ['javascript', 'typescript'];
  
  if (!supportedLanguages.includes(language)) {
    return {
      output: '',
      error: `Browser execution is only available for JavaScript and TypeScript. For ${language}, please use an external IDE or compiler.`,
    };
  }

  try {
    // Capture console.log outputs
    const logs: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = (...args) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    console.warn = (...args) => {
      logs.push(`⚠️ ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`);
    };
    console.error = (...args) => {
      logs.push(`❌ ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`);
    };

    // Process code based on language
    let processedCode = code;
    if (language === 'typescript') {
      processedCode = stripTypeScriptTypes(code);
    }

    // Create a sandboxed function
    const sandboxedCode = `
      "use strict";
      ${processedCode}
    `;
    
    // Execute with timeout
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Execution timed out (5s limit)')), 5000);
      
      try {
        const fn = new Function(sandboxedCode);
        const result = fn();
        clearTimeout(timeout);
        resolve(result);
      } catch (e) {
        clearTimeout(timeout);
        reject(e);
      }
    });

    // Restore console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;

    const output = logs.join('\n') + (result !== undefined ? `\n→ ${JSON.stringify(result)}` : '');
    
    return { output: output.trim() || 'Code executed successfully (no output)', error: null };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
