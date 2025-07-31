import { lazy, Suspense } from 'react';
import { EMBEDDED_VIDEOS } from '../embedded-videos';

// Lazy load video components for better performance
const VideoPlayer = lazy(() => import('./VideoPlayer'));
const VideoGrid = lazy(() => import('./VideoGrid'));

interface LazyVideoPlayerProps {
  videoPath: string;
  className?: string;
}

export const LazyVideoPlayer = ({ videoPath, className }: LazyVideoPlayerProps) => {
  return (
    <Suspense fallback={<div className={`${className} bg-gray-800 animate-pulse`} />}>
      <VideoPlayer videoPath={videoPath} className={className} />
    </Suspense>
  );
};

interface LazyVideoGridProps {
  videos: typeof EMBEDDED_VIDEOS;
  onVideoSelect: (path: string) => void;
}

export const LazyVideoGrid = ({ videos, onVideoSelect }: LazyVideoGridProps) => {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="aspect-video bg-gray-800 animate-pulse rounded-lg" />
        ))}
      </div>
    }>
      <VideoGrid videos={videos} onVideoSelect={onVideoSelect} />
    </Suspense>
  );
};