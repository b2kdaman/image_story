import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';

interface StoryContainerProps {
  messages: Message[];
  isGenerating: boolean;
}

export const StoryContainer: React.FC<StoryContainerProps> = ({
  messages,
  isGenerating
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="story-container" ref={containerRef}>
      {messages.length === 0 ? (
        <div className="empty-state">
          <h2>Welcome to Interactive Story</h2>
          <p>Start your adventure by typing your first action below.</p>
          <p className="hint">
            Example: "I wake up in a mysterious forest..."
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}

      {isGenerating && (
        <div className="generating-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}
    </div>
  );
};
