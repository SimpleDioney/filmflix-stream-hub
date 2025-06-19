
import { Badge } from '@/components/ui/badge';
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
            <div className="text-white font-semibold text-lg mb-2">▶</div>
            <p className="text-white text-sm">Assistir agora</p>
          </div>
        </div>

        <Badge 
          className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold"
        >
          {mediaTypeDisplay}
        </Badge>
      </div>
      
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </div>
  );
};

export default ContentCard;
