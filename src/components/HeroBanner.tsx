import { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroSkeleton } from '@/components/ui/loading-skeleton';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
}

interface HeroBannerProps {
  item: MediaItem | null;
  loading?: boolean;
  onPlayClick?: () => void;
  onInfoClick?: () => void;
  className?: string;
}

export const HeroBanner = ({
  item,
  loading = false,
  onPlayClick,
  onInfoClick,
  className,
}: HeroBannerProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setImageLoaded(false);
  }, [item?.id]);

  if (loading || !item) {
    return <HeroSkeleton />;
  }

  const title = item.title || item.name || 'Título não disponível';
  const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
  const rating = item.vote_average ? Math.round(item.vote_average * 10) : null;
  
  const backdropUrl = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : item.poster_path
    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
    : null;

  // Truncate overview to reasonable length
  const truncatedOverview = item.overview && item.overview.length > 300
    ? item.overview.substring(0, 300) + '...'
    : item.overview;

  return (
    <div className={cn('relative h-[85vh] min-h-[700px] w-full overflow-hidden', className)}>
      {/* Background Image with Parallax Effect */}
      {backdropUrl && (
        <>
          <div className="absolute inset-0 scale-110 transition-transform duration-[20s] ease-out hover:scale-105">
            <img
              src={backdropUrl}
              alt={title}
              className={cn(
                'w-full h-full object-cover transition-all duration-1000',
                imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          {/* Loading skeleton with shimmer */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          )}
        </>
      )}

      {/* Enhanced Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Enhanced Metadata */}
            <div className="flex items-center flex-wrap gap-3">
              {rating && (
                <Badge variant="secondary" className="bg-primary/90 text-white border-0 backdrop-blur-sm px-3 py-1">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {rating}% Match
                </Badge>
              )}
              {year && (
                <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
                  {year}
                </Badge>
              )}
              <Badge variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm">
                {item.media_type === 'tv' ? 'Série' : 'Filme'}
              </Badge>
              <Badge variant="outline" className="border-green-400/60 text-green-400 bg-green-400/10 backdrop-blur-sm">
                <Zap className="w-3 h-3 mr-1" />
                HD
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {title}
            </h1>

            {/* Overview */}
            {truncatedOverview && (
              <p className="text-lg text-white/90 leading-relaxed max-w-xl">
                {truncatedOverview}
              </p>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={onPlayClick}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Assistir Agora
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-md font-semibold px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={onInfoClick}
              >
                <Info className="w-5 h-5 mr-2" />
                Mais informações
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="absolute bottom-8 right-8">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Age Rating (optional overlay) */}
      <div className="absolute bottom-8 left-8">
        <Badge
          variant="outline"
          className="border-white/50 text-white bg-black/50 backdrop-blur-sm"
        >
          16+
        </Badge>
      </div>
    </div>
  );
};