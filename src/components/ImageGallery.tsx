import React, { useState, useEffect } from 'react';
import type { Message } from '../types';

interface ImageGalleryProps {
  messages: Message[];
  isGenerating: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ messages, isGenerating }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get all messages with images
  const imagesMessages = messages.filter(msg => msg.imageUrl);

  // Auto-advance to the latest image when a new one is generated
  useEffect(() => {
    if (imagesMessages.length > 0) {
      const newIndex = imagesMessages.length - 1;
      if (newIndex !== currentIndex) {
        setIsAnimating(true);
        setCurrentIndex(newIndex);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }
  }, [imagesMessages.length]);

  const goToNext = () => {
    if (currentIndex < imagesMessages.length - 1) {
      setIsAnimating(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goToIndex = (index: number) => {
    if (index !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  if (imagesMessages.length === 0 && !isGenerating) {
    return (
      <div className="image-gallery">
        <div className="empty-gallery">
          <div className="empty-gallery-icon">🎨</div>
          <h3>No Images Yet</h3>
          <p>Images will appear here as your story unfolds</p>
        </div>
      </div>
    );
  }

  const currentMessage = imagesMessages[currentIndex];

  return (
    <div className="image-gallery">
      {isGenerating && imagesMessages.length === 0 ? (
        <div className="image-loading">
          <div className="loading-spinner"></div>
          <p>Generating your first image...</p>
        </div>
      ) : imagesMessages.length > 0 ? (
        <>
          <div className={`image-display ${isAnimating ? 'animating' : ''}`}>
            <img
              src={currentMessage.imageUrl}
              alt={`Scene ${currentIndex + 1}`}
              className="gallery-image"
            />
            <div className="image-caption">
              <p>{currentMessage.content}</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="gallery-controls">
            <button
              className="nav-button prev"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              ‹
            </button>

            <div className="pagination-dots">
              {imagesMessages.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <button
              className="nav-button next"
              onClick={goToNext}
              disabled={currentIndex === imagesMessages.length - 1}
            >
              ›
            </button>
          </div>

          <div className="gallery-counter">
            {currentIndex + 1} / {imagesMessages.length}
          </div>

          {isGenerating && (
            <div className="generating-overlay">
              <div className="loading-spinner small"></div>
              <span>Generating new image...</span>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
