
interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
      <iframe
        src={url}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        frameBorder="0"
        allowFullScreen
        title="Video Player"
      />
    </div>
  );
};

export default VideoPlayer;
