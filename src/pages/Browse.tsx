import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Navigation } from '@/components/Navigation';
import { HeroBanner } from '@/components/HeroBanner';
import { MediaCarousel } from '@/components/MediaCarousel';
import { DetailsModal } from '@/components/DetailsModal';
import { PlayerModal } from '@/components/PlayerModal';
import { FilterPanel } from '@/components/FilterPanel';
import { EnhancedMediaCard } from '@/components/EnhancedMediaCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  progress?: number;
  seasonEpisode?: string;
  season_number?: number;
  episode_number?: number;
}

const Browse = () => {
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  // State for content
  const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
  const [discoverContent, setDiscoverContent] = useState<MediaItem[]>([]);
  const [myList, setMyList] = useState<MediaItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<MediaItem[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [myListLoading, setMyListLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');

  // Search state
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter and view states  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Toast
  const { toast } = useToast();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Load initial content
  useEffect(() => {
    if (isAuthenticated) {
      loadDiscoverContent();
      loadMyList();
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadDiscoverContent = async () => {
    try {
      setLoading(true);
      const data = await api.discover();
      const allContent = [...(data.movies || []), ...(data.series || [])];
      setDiscoverContent(allContent);
      const heroCandidate = allContent.find((item: MediaItem) => item.backdrop_path) || allContent[0];
      if (heroCandidate) {
        setHeroItem(heroCandidate);
      }
    } catch (error) {
      console.error('Error loading discover content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyList = async () => {
    try {
      setMyListLoading(true);
      const data = await api.getMyList();
      // Garantir que os dados tenham a estrutura correta
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        media_type: item.item_type === 'tv' ? 'tv' : 'movie'
      }));
      setMyList(formattedData);
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setMyListLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await api.getHistory();
      
      // Agrupar por série e pegar apenas o episódio mais recente (último assistido)
      const groupedData = data.reduce((acc: any, item: any) => {
        const key = `${item.tmdb_id}-${item.item_type}`;
        
        if (!acc[key]) {
          acc[key] = item;
        } else {
          // Pegar o item mais recente baseado na data de last_watched
          // Se não houver data, usar season/episode como fallback
          const currentItem = acc[key];
          const isNewer = item.season_number > currentItem.season_number || 
                         (item.season_number === currentItem.season_number && 
                          item.episode_number > currentItem.episode_number);
          
          if (isNewer) {
            acc[key] = item;
          }
        }
        
        return acc;
      }, {});
      
      // Converter para array e formatar
      const formattedData = Object.values(groupedData).map((item: any) => ({
        ...item,
        media_type: item.item_type === 'tv' ? 'tv' : 'movie',
        // Adicionar informações de temporada/episódio se disponível
        seasonEpisode: item.season_number && item.episode_number 
          ? `T${item.season_number}:E${item.episode_number}` 
          : null
      }));
      
      setContinueWatching(formattedData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchQuery('');
      return;
    }
    try {
      setIsSearching(true);
      setSearchQuery(query);
      const data = await api.search(query); // O segundo parâmetro 'multi' agora é o padrão no hook
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      // ✅ CORREÇÃO: Garante que o estado de "carregando" seja desativado
      setIsSearching(false);
    }
  };

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handlePlayClick = async (item: MediaItem) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    
    if (mediaType === 'tv') {
      // Para séries em "Continue Assistindo", ir direto para o episódio
      if ((item as any).seasonEpisode && (item as any).season_number && (item as any).episode_number) {
        const url = `https://megaembed.com/embed/series?tmdb=${item.id}&sea=${(item as any).season_number}&epi=${(item as any).episode_number}`;
        setPlayerUrl(url);
        setSelectedItem(item);
        setShowPlayerModal(true);
      } else {
        navigate(`/series/${item.id}`);
      }
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
      
      loadMyList();
      
      // Show toast notification
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

  const handleEpisodesClick = (item: MediaItem) => {
    if (item.media_type === 'tv' || item.name) {
      navigate(`/series/${item.id}`);
    }
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowPlayerModal(false);
    setSelectedItem(null);
    setPlayerUrl('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleSearch} />
      <main className="pt-16">
        {searchQuery ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Resultados para "{searchQuery}"</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterPanel(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
            
            <MediaCarousel
              title=""
              items={searchResults}
              loading={isSearching}
              onItemClick={handleItemClick}
              onPlayClick={handlePlayClick}
              onAddToList={handleAddToList}
              onEpisodesClick={handleEpisodesClick}
            />
          </div>
        ) : (
          <>
            <HeroBanner
              item={heroItem}
              loading={loading}
              onPlayClick={() => heroItem && handlePlayClick(heroItem)}
              onInfoClick={() => heroItem && handleItemClick(heroItem)}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
              {continueWatching.length > 0 && (
                <MediaCarousel
                  title="Continue Assistindo"
                  items={continueWatching}
                  loading={historyLoading}
                  showProgress={true}
                  onItemClick={handleItemClick}
                  onPlayClick={handlePlayClick}
                  onAddToList={handleAddToList}
                  onEpisodesClick={handleEpisodesClick}
                />
              )}
              {myList.length > 0 && (
                <MediaCarousel
                  title="Minha Lista"
                  items={myList}
                  loading={myListLoading}
                  onItemClick={handleItemClick}
                  onPlayClick={handlePlayClick}
                  onAddToList={handleAddToList}
                  onEpisodesClick={handleEpisodesClick}
                />
              )}
              <MediaCarousel
                title="Recomendados para Você"
                items={discoverContent}
                loading={loading}
                onItemClick={handleItemClick}
                onPlayClick={handlePlayClick}
                onAddToList={handleAddToList}
                onEpisodesClick={handleEpisodesClick}
              />
              <MediaCarousel
                title="Filmes em Alta"
                items={discoverContent.filter(item => item.media_type === 'movie' || item.title)}
                loading={loading}
                onItemClick={handleItemClick}
                onPlayClick={handlePlayClick}
                onAddToList={handleAddToList}
                onEpisodesClick={handleEpisodesClick}
              />
              <MediaCarousel
                title="Séries Populares"
                items={discoverContent.filter(item => item.media_type === 'tv' || item.name)}
                loading={loading}
                onItemClick={handleItemClick}
                onPlayClick={handlePlayClick}
                onAddToList={handleAddToList}
                onEpisodesClick={handleEpisodesClick}
              />
            </div>
          </>
        )}
      </main>
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onFiltersChange={() => {}} // Não usado na página Browse
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
          onEpisodesClick={() => {
            closeModals();
            handleEpisodesClick(selectedItem);
          }}
        />
      )}
      {showPlayerModal && (
        <PlayerModal
          url={playerUrl}
          title={selectedItem?.title || selectedItem?.name || ''}
          isOpen={showPlayerModal}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default Browse;
