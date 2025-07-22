import { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  runtime?: number;
  number_of_seasons?: number;
  genres?: Array<{ id: number; name: string }>;
  videos?: {
    results: Array<{
      key: string;
      type: string;
      site: string;
      name: string;
    }>;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
    }>;
  };
  recommendations?: {
    results: MediaItem[];
  };
}

interface DetailsModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  onAddToList: () => void;
  onEpisodesClick?: () => void; // New prop
}

export const DetailsModal = ({
  item,
  isOpen,
  onClose,
  onPlay,
  onAddToList,
  onEpisodesClick,
}: DetailsModalProps) => {
  const api = useApi();
  const [details, setDetails] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRecommendationClick = (recItem: MediaItem) => {
    // Fechar o modal atual
    onClose();
    
    // Aguardar um pouco e abrir novo modal ou navegar
    setTimeout(() => {
      const mediaType = recItem.media_type || (recItem.title ? 'movie' : 'tv');
      
      if (mediaType === 'tv') {
        // Para séries, navegar para página de episódios
        window.location.href = `/series/${recItem.id}`;
      } else {
        // Para filmes, seria melhor ter uma função callback
        // Por enquanto, força um reload da página com o novo item
        window.location.href = `/browse?modal=${recItem.id}`;
      }
    }, 100);
  };

  useEffect(() => {
    if (isOpen && item) {
      loadDetails();
      checkIfInList();
    }
  }, [isOpen, item]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
      const data = mediaType === 'tv'
        ? await api.tvDetails(item.id)
        : await api.movieDetails(item.id);
      
      setDetails(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfInList = async () => {
    try {
      const myList = await api.getMyList();
      const inList = myList.some((listItem: any) => listItem.tmdb_id === item.id);
      setIsInList(inList);
    } catch (error) {
      console.error('Erro ao verificar lista:', error);
    }
  };

  const handleAddToList = async () => {
    await onAddToList();
    setIsInList(!isInList);
  };

  const title = details?.title || details?.name || item.title || item.name || '';
  const year =
    details?.release_date?.split('-')[0] ||
    details?.first_air_date?.split('-')[0];
  const rating = details?.vote_average
    ? Math.round(details.vote_average * 10)
    : null;
  const runtime = details?.runtime;
  const seasons = details?.number_of_seasons;
  const isSeries = item.media_type === 'tv' || !!item.name;

  const backdropUrl =
    details?.backdrop_path || item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${
          details?.backdrop_path || item.backdrop_path
        }`
      : null;

  const trailer = details?.videos?.results?.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] overflow-hidden p-0 modal-shadow">
        <DialogTitle className="sr-only">{`Detalhes de ${title}`}</DialogTitle>
        <DialogDescription className="sr-only">
          {`Informações detalhadas sobre ${title} incluindo sinopse, elenco e recomendações.`}
        </DialogDescription>
        <div className="h-full overflow-y-auto">
          <div className="relative">
            {/* Capa */}
            <div className="relative h-96 overflow-hidden">
              {backdropUrl ? (
                <img
                  src={backdropUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  {rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{rating}%</span>
                    </div>
                  )}
                  {year && <span>{year}</span>}
                  {runtime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{runtime}min</span>
                    </div>
                  )}
                  {seasons && (
                    <span>{seasons} temporada{seasons > 1 ? 's' : ''}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={onPlay} className="bg-white text-black hover:bg-white/90">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Assistir
                  </Button>
                  
                  {/* Episodes List Button - Only for Series */}
                  {isSeries && onEpisodesClick && (
                    <Button
                      variant="secondary"
                      onClick={onEpisodesClick}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <List className="w-4 h-4 mr-2" />
                      Ver lista de episódios
                    </Button>
                  )}
                  
                  <Button
                    variant="secondary"
                    onClick={handleAddToList}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  >
                    {isInList ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isInList ? 'Na lista' : 'Minha lista'}
                  </Button>
                  {trailer && (
                    <Button
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/watch?v=${trailer.key}`,
                          '_blank'
                        )
                      }
                    >
                      Ver Trailer
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo Detalhado */}
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <LoadingSkeleton className="w-full h-20" />
                  <LoadingSkeleton className="w-3/4 h-6" />
                  <LoadingSkeleton className="w-1/2 h-6" />
                </div>
              ) : (
                <>
                  {details?.overview && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {details.overview}
                      </p>
                    </div>
                  )}

                  {details?.genres?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Gêneros</h3>
                      <div className="flex flex-wrap gap-2">
                        {details.genres.map((genre) => (
                          <Badge key={genre.id} variant="secondary">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {details?.credits?.cast?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Elenco</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {details.credits.cast.slice(0, 12).map((actor) => (
                          <div key={actor.id} className="text-center">
                            {actor.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                alt={actor.name}
                                className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                              />
                            ) : (
                              <div className="w-full aspect-[2/3] bg-muted rounded-lg mb-2 flex items-center justify-center">
                                <span className="text-muted-foreground text-xs">Sem foto</span>
                              </div>
                            )}
                            <p className="text-xs font-medium line-clamp-1">{actor.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{actor.character}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {details?.recommendations?.results?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Você também pode gostar</h3>

                      <div className="relative">
                        {/* Botões de navegação */}
                        <Button
                          onClick={() => scroll('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background p-1 rounded-full"
                          size="icon"
                          variant="ghost"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>

                        <div
                          ref={scrollRef}
                          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
                        >
                          {details.recommendations.results.slice(0, 10).map((rec) => (
                            <div
                              key={rec.id}
                              className="flex-shrink-0 w-32 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => handleRecommendationClick(rec)}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                                alt={rec.title || rec.name}
                                className="w-32 h-48 object-cover rounded-lg"
                              />
                              <p className="text-xs mt-2 line-clamp-2">{rec.title || rec.name}</p>
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={() => scroll('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background p-1 rounded-full"
                          size="icon"
                          variant="ghost"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
