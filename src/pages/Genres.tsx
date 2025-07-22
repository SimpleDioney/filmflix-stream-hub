import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Navigation } from '@/components/Navigation';
import { MediaCarousel } from '@/components/MediaCarousel';
import { DetailsModal } from '@/components/DetailsModal';
import { PlayerModal } from '@/components/PlayerModal';
import { FilterPanel } from '@/components/FilterPanel';
import { EnhancedMediaCard } from '@/components/EnhancedMediaCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Filter, Grid, List } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
}

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
}

const Genres = () => {
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Loading states
  const [genresLoading, setGenresLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [loadingFiltered, setLoadingFiltered] = useState(false);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');

  // Filter states
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('grid');
  const [filters, setFilters] = useState<any>({});
  const [showFiltered, setShowFiltered] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Load genres on mount
  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setGenresLoading(true);
      const data = await api.genres();
      setGenres(data || []); 
    } catch (error) {
      console.error('Error loading genres:', error);
    } finally {
      setGenresLoading(false);
    }
  };

  const loadMoviesByGenre = async (genre: Genre, page = 1) => {
    try {
      setMoviesLoading(true);
      const data = await api.discoverMedia({ 
        type: 'movie', 
        genreId: genre.id, 
        page 
      });
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading movies by genre:', error);
    } finally {
      setMoviesLoading(false);
    }
  };

  const loadFilteredContent = async (filterOptions: any) => {
    try {
      setLoadingFiltered(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filterOptions).filter(([key, value]) => 
          value !== 'all' && !(Array.isArray(value) && value[0] === 0)
        )
      );
      
      if (cleanFilters.rating && Array.isArray(cleanFilters.rating)) {
        cleanFilters.rating = cleanFilters.rating[0];
      }
      if (cleanFilters.genre && cleanFilters.genre !== 'all') {
        cleanFilters.genreId = cleanFilters.genre;
        delete cleanFilters.genre;
      }
      if (cleanFilters.type === 'all') {
        delete cleanFilters.type;
      }
      
      const data = await api.discoverMedia(cleanFilters);
      setFilteredContent(data.results || []);
    } catch (error) {
      console.error('Error loading filtered content:', error);
      setFilteredContent([]);
    } finally {
      setLoadingFiltered(false);
    }
  };

  const removeFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    if (filterKey === 'rating') {
      newFilters[filterKey] = [0];
    } else {
      newFilters[filterKey] = filterKey === 'type' ? 'all' : 'all';
    }
    setFilters(newFilters);
    if (hasActiveFilters(newFilters)) {
      loadFilteredContent(newFilters);
    } else {
      setShowFiltered(false);
      setFilteredContent([]);
    }
  };

  const hasActiveFilters = (currentFilters = filters) => {
    return Object.entries(currentFilters).some(([key, value]) => {
      if (key === 'rating') return Array.isArray(value) && value[0] > 0;
      if (key === 'type') return value !== 'all';
      return value !== 'all';
    });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    if (hasActiveFilters(newFilters)) {
      setShowFiltered(true);
      loadFilteredContent(newFilters);
    } else {
      setShowFiltered(false);
      setFilteredContent([]);
    }
  };

  const handleGenreClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
    setShowFiltered(false);
    loadMoviesByGenre(genre, 1);
  };

  const handlePageChange = (page: number) => {
    if (selectedGenre && page >= 1 && page <= totalPages) {
      loadMoviesByGenre(selectedGenre, page);
    }
  };

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handlePlayClick = async (item: MediaItem) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    
    if (mediaType === 'tv') {
      // Para séries, navegar para a página de episódios
      navigate(`/series/${item.id}`);
      return;
    }

    // Para filmes, abrir o player
    const streamUrl = `https://megaembed.com/embed/movie?tmdb=${item.id}`;
    setPlayerUrl(streamUrl);
    setSelectedItem(item);
    setShowPlayerModal(true);
    
    if (item) {
      updateWatchHistory(item, 0);  
    }
  };

  const handleAddToList = async (item: MediaItem) => {
    try {
      const result = await api.toggleMyList({
        tmdb_id: item.id,
        item_type: item.media_type || (item.title ? 'movie' : 'tv'),
        poster_path: item.poster_path,
        title: item.title || item.name || '',
      });
      
      toast({
        title: result.action === 'added' ? "Adicionado à lista" : "Removido da lista",
        description: `${item.title || item.name} foi ${result.action === 'added' ? 'adicionado à' : 'removido da'} sua lista.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling my list:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista.",
        variant: "destructive",
      });
    }
  };

  const updateWatchHistory = async (item: MediaItem, progress: number) => {
    try {
      await api.updateHistory({
        tmdb_id: item.id,
        item_type: item.media_type || (item.title ? 'movie' : 'tv'),
        poster_path: item.poster_path,
        title: item.title || item.name || '',
        progress,
      });
    } catch (error) {
      console.error('Error updating history:', error);
    }
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowPlayerModal(false);
    setSelectedItem(null);
    setPlayerUrl('');
  };

  // Generate pagination array
  const getPaginationArray = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages > 1) {
        rangeWithDots.push(1);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push('...');
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }
    
    if (totalPages > 1 && !rangeWithDots.includes(totalPages)) {
      rangeWithDots.push(totalPages);
    }
    
    if(rangeWithDots[0] === 1 && rangeWithDots[1] === 1) {
        rangeWithDots.shift();
    }

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Explorar por Gêneros</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterPanel(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
              >
                {viewMode === 'carousel' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Filtered Content Section */}
          {showFiltered && (
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Resultados Filtrados</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(filters).map(([key, value]) => {
                    if (key === 'rating' && Array.isArray(value) && value[0] > 0) {
                      return (
                        <Badge key={key} variant="secondary" className="flex items-center gap-1">
                          Avaliação: {value[0]}+
                          <button onClick={() => removeFilter(key)} className="ml-1 text-destructive hover:text-destructive/80">×</button>
                        </Badge>
                      );
                    }
                    if (value && value !== 'all') {
                      let displayValue = value;
                      if (key === 'type') displayValue = value === 'movie' ? 'Filmes' : 'Séries';
                      if (key === 'sortBy') {
                        const sortLabels: Record<string, string> = {
                          'popularity.desc': 'Popularidade',
                          'vote_average.desc': 'Melhores Avaliados',
                          'release_date.desc': 'Mais Recentes'
                        };
                        displayValue = sortLabels[value as string] || value;
                      }
                      if (key === 'genre') {
                        const genre = genres.find(g => g.id.toString() === value);
                        displayValue = genre?.name || value;
                      }
                      if (key === 'year') {
                        displayValue = value;
                      }
                      return (
                        <Badge key={key} variant="secondary" className="flex items-center gap-1">
                          {String(displayValue)}
                          <button onClick={() => removeFilter(key)} className="ml-1 text-destructive hover:text-destructive/80">×</button>
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              
              {viewMode === 'carousel' ? (
                <MediaCarousel
                  title=""
                  items={filteredContent}
                  loading={loadingFiltered}
                  onItemClick={handleItemClick}
                  onPlayClick={handlePlayClick}
                  onAddToList={handleAddToList}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredContent.map((item) => (
                    <EnhancedMediaCard
                      key={item.id}
                      item={item}
                      size="sm"
                      onClick={() => handleItemClick(item)}
                      onPlayClick={() => handlePlayClick(item)}
                      onAddToList={() => handleAddToList(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Genres Grid */}
          {!showFiltered && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
                {genresLoading
                  ? Array.from({ length: 15 }).map((_, i) => (
                      <LoadingSkeleton key={i} className="h-20" />
                    ))
                  : genres.map((genre) => (
                      <Card
                        key={genre.id}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                          selectedGenre?.id === genre.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleGenreClick(genre)}
                      >
                        <CardContent className="p-4 text-center">
                          <h3 className="font-semibold text-sm">{genre.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
              </div>

              {/* Genre Content */}
              {selectedGenre && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {selectedGenre.name}
                    </h2>
                    {totalPages > 1 && (
                        <div className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </div>
                    )}
                  </div>

                  {moviesLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {Array.from({ length: 18 }).map((_, index) => (
                         <CardSkeleton key={index} />
                      ))}
                    </div>
                  ) : movies.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {movies.map((movie) => (
                          <EnhancedMediaCard
                            key={movie.id}
                            item={movie}
                            size="sm"
                            onClick={() => handleItemClick(movie)}
                            onPlayClick={() => handlePlayClick(movie)}
                            onAddToList={() => handleAddToList(movie)}
                          />
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 mt-8">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          {getPaginationArray().map((page, index) => (
                            <Button
                              key={index}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              className="min-w-[40px]"
                              onClick={() => typeof page === 'number' && handlePageChange(page)}
                              disabled={typeof page === 'string'}
                            >
                              {page}
                            </Button>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Nenhum filme encontrado para este gênero.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!selectedGenre && !genresLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Selecione um gênero para ver os filmes disponíveis ou use os filtros avançados
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onFiltersChange={handleFiltersChange}
      />

      {showDetailsModal && selectedItem && (
        <DetailsModal
          item={selectedItem}
          isOpen={showDetailsModal}
          onClose={closeModals}
          onPlay={() => {
            closeModals();
            handlePlayClick(selectedItem);
          }}
          onAddToList={() => handleAddToList(selectedItem)}
        />
      )}

      {showPlayerModal && selectedItem && (
        <PlayerModal
          url={playerUrl}
          title={selectedItem.title || selectedItem.name || ''}
          isOpen={showPlayerModal}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default Genres;

// Componente de Skeleton para o card de mídia
const CardSkeleton = () => (
    <div className="flex-shrink-0 w-full space-y-2">
      <LoadingSkeleton className="w-full aspect-[2/3] rounded-lg" />
      <LoadingSkeleton className="w-3/4 h-4" />
    </div>
);