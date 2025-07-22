import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from './MediaCard';
import { CardSkeleton } from '@/components/ui/loading-skeleton';
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
  seasonEpisode?: string;
  season_number?: number;
  episode_number?: number;
}

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  loading?: boolean;
  showProgress?: boolean;
  onItemClick?: (item: MediaItem) => void;
  onPlayClick?: (item: MediaItem) => void;
  onAddToList?: (item: MediaItem) => void;
  onEpisodesClick?: (item: MediaItem) => void; // New prop
  className?: string;
}

export const MediaCarousel = ({
  title,
  items,
  loading = false,
  showProgress = false,
  onItemClick,
  onPlayClick,
  onAddToList,
  onEpisodesClick,
  className,
}: MediaCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <div className="skeleton w-48 h-8" />
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="flex items-center justify-center h-72 bg-muted rounded-lg">
          <p className="text-muted-foreground">Nenhum item encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('group space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item) => (
            <MediaCard
              key={`${item.id}-${item.media_type || 'movie'}`}
              item={item}
              size="md"
              showProgress={showProgress}
              onClick={() => onItemClick?.(item)}
              onPlayClick={() => onPlayClick?.(item)}
              onAddToList={() => onAddToList?.(item)}
              onEpisodesClick={() => onEpisodesClick?.(item)}
            />
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

    </div>
  );
};