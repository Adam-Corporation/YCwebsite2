import React from 'react';
import './ProgressMap.css';

interface ProgressMapProps {
  videoCount: number;
  currentVideo: number;
  visible: boolean;
  onDotClick: (index: number) => void;
}

const ProgressMap: React.FC<ProgressMapProps> = ({ videoCount, currentVideo, visible, onDotClick }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="progress-map-container">
      <div className="progress-dots">
        {Array.from({ length: videoCount }).map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentVideo ? 'active' : ''}`}
            onClick={() => onDotClick(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ProgressMap;
