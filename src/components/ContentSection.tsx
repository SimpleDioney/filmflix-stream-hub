
import { useState } from 'react';
import ContentCard from './ContentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { MediaItem } from '@/types/media';

interface ContentSectionProps {
  title: string;
  content: MediaItem[];
  loading: boolean;
  onMediaSelect: (id: number, type: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ContentSection = ({ 
  title, 
  content, 
  loading, 
  onMediaSelect, 
  onLoadMore,
  hasMore = false 
}: ContentSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const displayedContent = showAll ? content : content.slice(0, 12);

  if (loading && content.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg bg-card" />
              <Skeleton className="h-4 w-3/4 bg-card" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!content || content.length === 0) {
    return null;
  }

  const filteredContent = displayedContent.filter(
    item => item.poster_path && item.media_type !== 'person'
  );

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {content.length > 12 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-primary/80"
          >
            {showAll ? 'Ver menos' : 'Ver mais'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredContent.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onSelect={onMediaSelect}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </section>
  );
};

export default ContentSection;
