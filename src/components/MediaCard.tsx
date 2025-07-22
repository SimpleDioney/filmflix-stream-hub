import { useState } from 'react';
import { Play, Plus, Info, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  progress?: number; // For continue watching
  seasonEpisode?: string;
  season_number?: number;
  episode_number?: number;
}

interface MediaCardProps {
  item: MediaItem;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
  onPlayClick?: () => void;
  onAddToList?: () => void;
  onEpisodesClick?: () => void; // New prop for episodes list
  className?: string;
}

export const MediaCard = ({
  item,
  size = 'md',
  showProgress = false,
  onClick,
  onPlayClick,
  onAddToList,
  onEpisodesClick,
  className,
}: MediaCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = item.title || item.name || 'Sem título';
  const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
  const rating = item.vote_average ? Math.round(item.vote_average * 10) : null;
  const isSeries = item.media_type === 'tv' || !!item.name;
  const isContinueWatching = showProgress && item.seasonEpisode;

  const sizeClasses = {
    sm: 'w-28 h-42 sm:w-32 sm:h-48', // Smaller on mobile
    md: 'w-40 h-60 sm:w-48 sm:h-72', // Responsive sizing
    lg: 'w-52 h-78 sm:w-64 sm:h-96'
  };

  const imageUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  return (
    <div 
      className={cn(
        'group relative flex-shrink-0 cursor-pointer transition-transform duration-300',
        'hover:scale-105 active:scale-95', // Added active state for touch feedback
        className
      )}
      onClick={onClick}
    >
      {/* Main Card */}
      <div className={cn('relative overflow-hidden rounded-lg bg-card', sizeClasses[size])}>
        {/* Image */}
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-muted-foreground/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && !imageError && imageUrl && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Hover overlay - Also shows on mobile tap */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2 sm:p-4">
          {/* Top section - Rating */}
          <div className="flex justify-end">
            {rating && (
              <Badge variant="secondary" className="text-xs">
                {rating}%
              </Badge>
            )}
          </div>

          {/* Bottom section - Info and Actions */}
          <div className="space-y-2 sm:space-y-3">
            <div>
              <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-2 mb-1">
                {title}
              </h3>
              <div className="flex items-center justify-between text-xs text-white/80">
                {year && <span>{year}</span>}
                {isContinueWatching && (
                  <span className="text-primary font-medium">{item.seasonEpisode}</span>
                )}
              </div>
            </div>

            {/* Action Buttons - Mobile Responsive */}
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
              {/* Primary Action - Play button */}
              <Button
                size="sm"
                variant="secondary"
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs w-full sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayClick?.();
                }}
              >
                <Play className="w-3 h-3 mr-1" />
                {isContinueWatching ? 'Continuar' : 'Assistir'}
              </Button>

              {/* Secondary Actions */}
              <div className="flex justify-between sm:justify-end sm:space-x-2">
                {/* Episodes List Button - Only for Series */}
                {isSeries && onEpisodesClick && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 sm:h-8 px-2 text-xs hover:bg-white/20 flex-1 sm:flex-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEpisodesClick();
                    }}
                  >
                    <List className="w-3 h-3 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Episódios</span>
                  </Button>
                )}

                {/* Add to List Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 sm:h-8 w-7 sm:w-8 p-0 hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToList?.();
                  }}
                >
                  <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>

                {/* Info Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 sm:h-8 w-7 sm:w-8 p-0 hover:bg-white/20"
                  onClick={onClick}
                >
                  <Info className="w-3 sm:w-4 h-3 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for continue watching */}
        {showProgress && typeof item.progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};