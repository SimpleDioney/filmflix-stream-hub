
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info } from 'lucide-react';
import { fetchFromTmdb } from '@/lib/tmdb';
import type { MediaDetails } from '@/types/media';

interface HeroBannerProps {
  onPlay: (id: number, type: string) => void;
}

const HeroBanner = ({ onPlay }: HeroBannerProps) => {
  const [featuredContent, setFeaturedContent] = useState<MediaDetails | null>(null);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      const trending = await fetchFromTmdb('/trending/all/day');
      if (trending?.results?.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(10, trending.results.length));
        const item = trending.results[randomIndex];
        const details = await fetchFromTmdb(`/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`);
        if (details) {
          setFeaturedContent(details);
        }
      }
    };

    loadFeaturedContent();
  }, []);

  if (!featuredContent) return null;

  const title = featuredContent.title || featuredContent.name;
  const mediaType = featuredContent.title ? 'movie' : 'tv';
  const year = featuredContent.release_date?.split('-')[0] || featuredContent.first_air_date?.split('-')[0];
  const rating = featuredContent.vote_average ? Math.round(featuredContent.vote_average * 10) / 10 : null;

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredContent.backdrop_path})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      
      <div className="relative z-10 h-full flex items-center px-4 md:px-8">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              {title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm">
              {rating && (
                <div className="flex items-center gap-1">
                  <span className="text-red-500">★</span>
                  <span className="text-foreground font-medium">{rating}</span>
                  <span className="text-muted-foreground">TMDB</span>
                </div>
              )}
              {year && (
                <Badge variant="outline" className="text-foreground">
                  {year}
                </Badge>
              )}
              <Badge variant="outline" className="text-foreground">
                {mediaType === 'movie' ? 'Filme' : 'Série'}
              </Badge>
              {featuredContent.runtime && (
                <span className="text-muted-foreground">
                  {Math.floor(featuredContent.runtime / 60)}h {featuredContent.runtime % 60}m
                </span>
              )}
            </div>
          </div>

          {featuredContent.overview && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl line-clamp-3">
              {featuredContent.overview}
            </p>
          )}

          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-semibold"
              onClick={() => onPlay(featuredContent.id, mediaType)}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Assistir
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-muted-foreground text-foreground hover:bg-muted-foreground/10"
            >
              <Info className="w-5 h-5 mr-2" />
              Mais informações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
