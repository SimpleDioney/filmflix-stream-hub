
import { useState, useEffect } from 'react';
import { X, Star, Calendar, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchFromTmdb } from '@/lib/tmdb';
import VideoPlayer from './VideoPlayer';
import SeriesSelector from './SeriesSelector';
import type { MediaDetails } from '@/types/media';

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
          setVideoUrl(`https://megaembed.com/embed/movie?tmdb=${mediaId}`);
        }
      }
      setLoading(false);
    };

    loadDetails();
  }, [mediaId, mediaType]);

  const handleEpisodeSelect = (seasonNumber: number, episodeNumber: number) => {
    setVideoUrl(`https://megaembed.com/embed/series?tmdb=${mediaId}&sea=${seasonNumber}&epi=${episodeNumber}`);
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
  const year = details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0];
  const rating = details.vote_average ? Math.round(details.vote_average * 10) / 10 : null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl bg-card border-border p-0 max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {details.backdrop_path && (
            <div className="relative h-64 md:h-80">
              <img
                src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-4 text-white hover:text-white hover:bg-black/20 z-10"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          )}
          
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                {details.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                    alt={title}
                    className="w-full rounded-lg shadow-lg"
                  />
                )}
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {rating && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-foreground font-medium">{rating}</span>
                        <span className="text-muted-foreground text-sm">TMDB</span>
                      </div>
                    )}
                    {year && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{year}</span>
                      </div>
                    )}
                    {details.runtime && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {mediaType === 'movie' ? 'Filme' : 'Série'}
                    </Badge>
                    {details.genres?.slice(0, 3).map((genre) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {details.overview && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Sinopse</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {details.overview}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {videoUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Assistir</h3>
                <VideoPlayer url={videoUrl} />
              </div>
            )}
            
            {mediaType === 'tv' && details.seasons && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Temporadas e Episódios</h3>
                <SeriesSelector
                  seriesId={mediaId}
                  seasons={details.seasons}
                  onEpisodeSelect={handleEpisodeSelect}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaModal;
