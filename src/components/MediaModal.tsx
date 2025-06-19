
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchFromTmdb } from '@/lib/tmdb';
import VideoPlayer from './VideoPlayer';
import SeriesSelector from './SeriesSelector';
import type { MediaDetails, Season } from '@/types/media';

interface MediaModalProps {
  mediaId: number;
  mediaType: string;
  onClose: () => void;
}

const MediaModal = ({ mediaId, mediaType, onClose }: MediaModalProps) => {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchFromTmdb(`/${mediaType}/${mediaId}`);
      if (data) {
        setDetails(data);
        
        if (mediaType === 'movie') {
          setVideoUrl(`https://vidsrc.to/embed/movie/${mediaId}`);
        }
      }
      setLoading(false);
    };

    loadDetails();
  }, [mediaId, mediaType]);

  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    setVideoUrl(`https://vidsrc.to/embed/tv/${mediaId}/${seasonNumber}/${episodeNumber}`);
  };

  if (loading || !details) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-card border-border">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const title = details.title || details.name;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-card border-border p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {videoUrl && <VideoPlayer url={videoUrl} />}
          
          {mediaType === 'tv' && details.seasons && (
            <SeriesSelector
              seriesId={mediaId}
              seasons={details.seasons}
              onEpisodeSelect={handleEpisodeSelect}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaModal;
