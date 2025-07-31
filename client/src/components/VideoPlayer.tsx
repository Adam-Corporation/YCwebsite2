interface VideoPlayerProps {
  videoPath: string;
  className?: string;
}

const VideoPlayer = ({ videoPath, className }: VideoPlayerProps) => {
  return (
    <div className={className}>
      <video
        src={videoPath}
        controls
        muted
        playsInline
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  );
};

export default VideoPlayer;