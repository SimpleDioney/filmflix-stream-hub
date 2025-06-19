
import ContentCard from './ContentCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { MediaItem } from '@/types/media';

interface ContentGridProps {
  content: MediaItem[];
  loading: boolean;
  onMediaSelect: (id: number, type: string) => void;
}

const ContentGrid = ({ content, loading, onMediaSelect }: ContentGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg bg-card" />
            <Skeleton className="h-4 w-3/4 bg-card" />
          </div>
        ))}
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-lg">Nenhum conteúdo encontrado.</p>
      </div>
    );
  }

  const filteredContent = content.filter(
    item => item.poster_path && item.media_type !== 'person'
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredContent.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          onSelect={onMediaSelect}
        />
      ))}
    </div>
  );
};

export default ContentGrid;
