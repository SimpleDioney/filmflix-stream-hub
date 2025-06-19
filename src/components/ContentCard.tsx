
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import type { MediaItem } from '@/types/media';

interface ContentCardProps {
  item: MediaItem;
  onSelect: (id: number, type: string) => void;
}

const ContentCard = ({ item, onSelect }: ContentCardProps) => {
  const title = item.title || item.name;
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  const mediaTypeDisplay = mediaType === 'movie' ? 'Filme' : 'Série';
  const imageUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0];
  const rating = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null;

  return (
    <div
      className="group cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={() => onSelect(item.id, mediaType)}
    >
      <div className="relative overflow-hidden rounded-lg bg-card shadow-lg">
        <img
          src={imageUrl}
          alt={title}
          className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mb-2">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
            <p className="text-white text-sm font-medium">Assistir agora</p>
          </div>
        </div>

        <div className="absolute top-2 right-2 space-y-1">
          <Badge 
            className="bg-primary text-primary-foreground text-xs font-bold"
          >
            {mediaTypeDisplay}
          </Badge>
          {rating && (
            <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-xs font-bold text-white flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {rating}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
            {title}
          </h3>
          {year && (
            <p className="text-gray-300 text-xs">{year}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
