import React from 'react';
import { Users, Crown } from 'lucide-react';
import { Participant } from '@/lib/mockBackend';

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId: string;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, currentUserId }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">
          Participants ({participants.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 rounded-md bg-secondary/50"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: participant.color + '20', color: participant.color }}
            >
              {participant.name.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {participant.name}
                </span>
                {participant.isHost && (
                  <Crown className="w-3 h-3 text-warning" />
                )}
                {participant.id === currentUserId && (
                  <span className="text-xs text-muted-foreground">(you)</span>
                )}
              </div>
            </div>
            
            <div
              className="w-2 h-2 rounded-full animate-pulse-slow"
              style={{ backgroundColor: participant.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;
