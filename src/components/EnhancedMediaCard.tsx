import { useState, useRef } from 'react';
import { Play, Plus, Info, Star, Clock, Calendar, Heart } from 'lucide-react';
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
  progress?: number;
  overview?: string;
  genre_ids?: number[];
}

interface EnhancedMediaCardProps {
  item: MediaItem;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showDetailed?: boolean;
  onClick?: () => void;
  onPlayClick?: () => void;
  onAddToList?: () => void;
  className?: string;
}

export const EnhancedMediaCard = ({
  item,
  size = 'md',
  showProgress = false,
  showDetailed = false,
  onClick,
  onPlayClick,
  onAddToList,
  className,
}: EnhancedMediaCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const title = item.title || item.name || 'Sem título';
  const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
  const rating = item.vote_average ? Math.round(item.vote_average * 10) : null;

  const sizeClasses = {
    sm: 'w-32 h-48',
    md: 'w-48 h-72',
    lg: 'w-64 h-96'
  };

  const imageUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return (
    <div 
      className={cn(
        'group relative flex-shrink-0 cursor-pointer transition-all duration-500',
        'hover:scale-110 hover:z-10',
        className
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Card */}
      <div className={cn(
        'relative overflow-hidden rounded-lg bg-card shadow-lg transition-all duration-500',
        'group-hover:shadow-2xl group-hover:shadow-primary/20',
        sizeClasses[size]
      )}>
        {/* Image */}
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-110'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium line-clamp-2">{title}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && !imageError && imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
        )}

        {/* Quality Badge */}
        {rating && rating >= 80 && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-primary text-primary-foreground">
              HD
            </Badge>
          </div>
        )}

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs flex items-center space-x-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{(rating/10).toFixed(1)}</span>
            </Badge>
          </div>
        )}

        {/* Hover overlay - Simple version */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          'flex flex-col justify-end p-4'
        )}>
          <div className="space-y-2">
            <h3 className="font-semibold text-white text-sm line-clamp-2">
              {title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-white/80">
              {year && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{year}</span>
                </div>
              )}
              <span className="capitalize">
                {item.media_type === 'tv' ? 'Série' : 'Filme'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs bg-white text-black hover:bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayClick?.();
                  }}
                >
                  <Play className="w-3 h-3 mr-1 fill-current" />
                  Play
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToList?.();
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-white/20"
                  onClick={onClick}
                >
                  <Info className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details on Extended Hover */}
        {isHovered && showDetailed && (
          <div className="absolute -bottom-20 left-0 right-0 bg-card border border-border rounded-b-lg shadow-2xl p-3 z-20">
            <div className="space-y-2">
              {item.overview && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {item.overview}
                </p>
              )}
              <div className="flex flex-wrap gap-1">
                {/* Placeholder for genres - você pode expandir isso com dados reais */}
                <Badge variant="outline" className="text-xs">Ação</Badge>
                <Badge variant="outline" className="text-xs">Drama</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar for continue watching */}
        {showProgress && typeof item.progress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};