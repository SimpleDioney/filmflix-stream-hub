
interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
      <iframe
        src={url}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Video Player"
      />
    </div>
  );
};

export default VideoPlayer;
