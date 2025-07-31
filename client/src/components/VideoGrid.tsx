import { EMBEDDED_VIDEOS } from '../embedded-videos';

interface VideoGridProps {
  videos: typeof EMBEDDED_VIDEOS;
  onVideoSelect: (path: string) => void;
}

const VideoGrid = ({ videos, onVideoSelect }: VideoGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {videos.map((video, index) => (
        <div
          key={video.path}
          className="aspect-video bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => onVideoSelect(video.path)}
        >
          <div className="w-full h-full flex items-center justify-center text-white">
            Video {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;