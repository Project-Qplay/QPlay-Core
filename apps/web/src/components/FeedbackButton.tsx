import React from 'react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { Room } from '../types/game';
import { ROOM_FEEDBACK_URLS } from '../types/feedback';

interface FeedbackButtonProps {
  roomId: Room;
  className?: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  roomId, 
  className = '' 
}) => {
  const feedbackConfig = ROOM_FEEDBACK_URLS[roomId];
  
  if (!feedbackConfig) {
    return null; // No feedback form available for this room
  }

  const handleFeedbackClick = () => {
    window.open(feedbackConfig.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleFeedbackClick}
      className={`
        flex items-center justify-center gap-2 
        px-4 py-2 
        bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-500 hover:to-purple-500 
        text-white font-medium 
        rounded-lg 
        transition-all duration-200 
        transform hover:scale-105
        ${className}
      `}
      title={feedbackConfig.title}
    >
      <MessageSquare className="w-4 h-4" />
      Share Feedback
      <ExternalLink className="w-3 h-3" />
    </button>
  );
};

export default FeedbackButton;