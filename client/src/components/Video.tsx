import React from 'react';
import './Video.css';

interface VideoProps {
  title: string;
  explanation: string;
  detailedExplanation: string;
  videoSrc: string;
  isVisible: boolean;
}

const Video: React.FC<VideoProps> = ({ title, explanation, detailedExplanation, videoSrc, isVisible }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
      // Pause the video if it's playing and the section scrolls out of view
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isVisible]);

  const handleWatchVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setIsExpanded(true);
  };

  return (
    <div className="video-section-standalone">
      <div className={`text-overlay-fullscreen ${!isExpanded && isVisible ? 'active' : ''}`}>
        <div className="overlay-content">
          <div className="text-anim-wrapper">
            <h2 className="demo-title">{title}</h2>
            <p className="explanation-text">{explanation}</p>
            <p>{detailedExplanation}</p>
          </div>
          <button className="watch-video-btn" onClick={handleWatchVideo}>
            Watch The Video
          </button>
        </div>
      </div>
      <div className={`video-container ${isExpanded ? 'expanded' : ''}`}>
        <div className="video-wrapper">
          <video ref={videoRef} className="demo-video" controls playsInline>
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
};

export default Video;
