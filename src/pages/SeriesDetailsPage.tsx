import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Navigation } from '@/components/Navigation';
import { PlayerModal } from '@/components/PlayerModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Play, Star, Calendar, Tv, Check, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces para os dados da API
interface SeriesDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  number_of_seasons: number;
  seasons: SeasonSummary[];
}

interface SeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface SeasonDetails {
  episodes: Episode[];
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
  watched?: boolean;
  progress?: number;
}

const SeriesDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const [series, setSeries] = useState<SeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<SeasonDetails | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());

  // State do Player
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');
  const [playerTitle, setPlayerTitle] = useState('');
  
  const { toast } = useToast();

  // Função para recarregar histórico
  const loadUserHistory = async () => {
    try {
      const historyData = await api.getHistory();
      const seriesHistory = historyData.filter((item: any) => item.tmdb_id === Number(id));
      setUserHistory(seriesHistory);
      
      // Criar set de episódios assistidos
      const watched = new Set<string>();
      seriesHistory.forEach((item: any) => {
        if (item.season_number && item.episode_number && item.progress === 100) {
          watched.add(`${item.season_number}-${item.episode_number}`);
        }
      });
      setWatchedEpisodes(watched);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/browse');
      return;
    }

    const loadSeriesDetails = async () => {
      try {
        setLoadingSeries(true);
        const data = await api.tvDetails(Number(id));
        setSeries(data);
        
        // Carrega o histórico do usuário
        await loadUserHistory();
        
        // Carrega a primeira temporada por padrão
        if (data.seasons && data.seasons.length > 0) {
          const defaultSeason = data.seasons.find(s => s.season_number === 1) || data.seasons[0];
          handleSeasonChange(String(defaultSeason.season_number));
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da série:", error);
        navigate('/browse');
      } finally {
        setLoadingSeries(false);
      }
    };

    loadSeriesDetails();
  }, [id, navigate]);

  // Recarregar histórico quando a temporada mudar
  useEffect(() => {
    if (id && selectedSeasonNumber && series) {
      loadUserHistory();
    }
  }, [selectedSeasonNumber, id]);

  const handleSeasonChange = async (seasonNumberStr: string) => {
    const seasonNumber = Number(seasonNumberStr);
    if (!id || isNaN(seasonNumber)) return;

    try {
      setLoadingSeason(true);
      setSelectedSeasonNumber(seasonNumber);
      const data = await api.tvSeasonDetails(Number(id), seasonNumber);
      setSelectedSeason(data);
    } catch (error) {
      console.error(`Erro ao carregar temporada ${seasonNumber}:`, error);
    } finally {
      setLoadingSeason(false);
    }
  };

  const handlePlayEpisode = async (episode: Episode) => {
    const url = `https://megaembed.com/embed/series?tmdb=${id}&sea=${episode.season_number}&epi=${episode.episode_number}`;
    setPlayerUrl(url);
    setPlayerTitle(`${series?.name} - T${episode.season_number}:E${episode.episode_number} ${episode.name}`);
    setShowPlayer(true);
    
    // Atualizar histórico ao iniciar episódio
    try {
      await api.updateHistory({
        tmdb_id: Number(id),
        item_type: 'tv',
        poster_path: series?.poster_path || '',
        title: series?.name || '',
        progress: 0,
        season_number: episode.season_number,
        episode_number: episode.episode_number,
      });
    } catch (error) {
      console.error('Erro ao atualizar histórico:', error);
    }
  };

  const handleMarkAsWatched = async (episode: Episode) => {
    try {
      const episodeKey = `${episode.season_number}-${episode.episode_number}`;
      const isWatched = watchedEpisodes.has(episodeKey);
      
      if (!isWatched) {
        await api.updateHistory({
          tmdb_id: Number(id),
          item_type: 'tv',
          poster_path: series?.poster_path || '',
          title: series?.name || '',
          progress: 100,
          season_number: episode.season_number,
          episode_number: episode.episode_number,
        });
        
        // Recarregar histórico para garantir persistência
        await loadUserHistory();
        
        toast({
          title: "Episódio marcado como assistido",
          description: `T${episode.season_number}:E${episode.episode_number} - ${episode.name}`,
        });
      }
    } catch (error) {
      console.error('Erro ao marcar episódio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o episódio como assistido",
        variant: "destructive",
      });
    }
  };

  const getNextEpisode = () => {
    if (!selectedSeason?.episodes) return null;
    
    // Se não há histórico, retornar o primeiro episódio da temporada atual
    if (!userHistory.length) {
      return selectedSeason.episodes[0];
    }
    
    // Obter o histórico apenas da série atual
    const seriesHistory = userHistory.filter(item => 
      item.tmdb_id === Number(id) && item.season_number && item.episode_number
    );
    
    if (seriesHistory.length === 0) {
      return selectedSeason.episodes[0];
    }
    
    // Encontrar o último episódio assistido globalmente (considerando todas as temporadas)
    const lastWatchedEpisode = seriesHistory.reduce((latest, current) => {
      if (!latest) return current;
      
      if (current.season_number > latest.season_number ||
          (current.season_number === latest.season_number && current.episode_number > latest.episode_number)) {
        return current;
      }
      return latest;
    }, null as any);
    
    if (!lastWatchedEpisode) {
      return selectedSeason.episodes[0];
    }
    
    // Se o último episódio assistido foi 100% assistido, procurar o próximo
    if (lastWatchedEpisode.progress === 100) {
      // Se estamos visualizando a mesma temporada do último episódio assistido
      if (selectedSeasonNumber === lastWatchedEpisode.season_number) {
        // Procurar o próximo episódio na temporada atual
        const nextEpisodeIndex = selectedSeason.episodes.findIndex(ep => 
          ep.episode_number === lastWatchedEpisode.episode_number
        );
        
        if (nextEpisodeIndex >= 0 && nextEpisodeIndex < selectedSeason.episodes.length - 1) {
          return selectedSeason.episodes[nextEpisodeIndex + 1];
        }
        
        // Se é o último episódio da temporada, retornar o último
        return selectedSeason.episodes[selectedSeason.episodes.length - 1];
      } else {
        // Se estamos em uma temporada diferente, mostrar o primeiro episódio da temporada atual
        return selectedSeason.episodes[0];
      }
    }
    
    // Se o último episódio não foi 100% assistido, continuar nele (se estiver na mesma temporada)
    if (selectedSeasonNumber === lastWatchedEpisode.season_number) {
      const continueEpisode = selectedSeason.episodes.find(ep => 
        ep.episode_number === lastWatchedEpisode.episode_number
      );
      
      if (continueEpisode) {
        return continueEpisode;
      }
    }
    
    // Fallback: primeiro episódio da temporada atual
    return selectedSeason.episodes[0];
  };

  if (loadingSeries) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">

        <Navigation />
        <div className="p-8">
          <LoadingSkeleton className="h-[50vh] w-full mb-8" />
          <LoadingSkeleton className="h-12 w-1/2 mb-4" />
          <LoadingSkeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!series) {
    navigate('/browse');
    return null;
  }
  
  const backdropUrl = `https://image.tmdb.org/t/p/original${series.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${series.poster_path}`;

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        {/* Hero Section */}
        <div className="relative h-[60vh] -mt-16">
          <img src={backdropUrl} alt={series.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-6 sm:space-y-0 sm:space-x-8">
              <img src={posterUrl} alt={series.name} className="w-48 rounded-lg shadow-lg" />
              <div className="text-white space-y-4">
                <h1 className="text-3xl sm:text-5xl font-bold">{series.name}</h1>
                <div className="flex items-center space-x-4 text-lg">
                  <span className="flex items-center"><Star className="w-5 h-5 mr-2 text-yellow-400 fill-current" /> {series.vote_average.toFixed(1)}</span>
                  <span className="flex items-center"><Calendar className="w-5 h-5 mr-2" /> {series.first_air_date.split('-')[0]}</span>
                  <span className="flex items-center"><Tv className="w-5 h-5 mr-2" /> {series.number_of_seasons} Temporada(s)</span>
                </div>
                <p className="max-w-full sm:max-w-2xl text-white/80 line-clamp-3">{series.overview}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons and Episodes Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Episódios</h2>
              {getNextEpisode() && userHistory.length > 0 && (
                <Button 
                  className="mt-2"
                  onClick={() => handlePlayEpisode(getNextEpisode()!)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continuar - T{getNextEpisode()!.season_number}:E{getNextEpisode()!.episode_number}
                </Button>
              )}
            </div>
            <Select onValueChange={handleSeasonChange} defaultValue={String(selectedSeasonNumber)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Selecionar temporada" />
              </SelectTrigger>
              <SelectContent>
                {series.seasons
                  .filter(s => s.season_number > 0) // Filtra especiais (temporada 0)
                  .map(season => (
                  <SelectItem key={season.id} value={String(season.season_number)}>
                    {season.name} ({season.episode_count} episódios)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingSeason ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedSeason?.episodes.map(episode => {
                const episodeKey = `${episode.season_number}-${episode.episode_number}`;
                const isWatched = watchedEpisodes.has(episodeKey);
                const currentProgress = userHistory.find(h => 
                  h.season_number === episode.season_number && 
                  h.episode_number === episode.episode_number
                );
                
                return (
                <Card key={episode.id} className={`bg-card overflow-hidden flex flex-col ${currentProgress && currentProgress.progress < 100 ? 'ring-2 ring-primary' : ''}`}>
                   <div className="relative">
                     <img 
                       src={episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : posterUrl} 
                       alt={episode.name}
                       className="w-full h-40 object-cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                     <div className="absolute top-2 right-2">
                       
                     </div>
                     <div className="absolute bottom-2 left-4 text-white">
                       <h3 className="font-bold">Episódio {episode.episode_number}</h3>
                       
                     </div>
                   </div>
                   <CardContent className="p-4 flex-grow flex flex-col">
                     <CardTitle className="text-lg mb-2">{episode.name}</CardTitle>
                     <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{episode.overview}</p>
                     <Button className="mt-4 w-full" onClick={() => handlePlayEpisode(episode)}>
                       <Play className="w-4 h-4 mr-2" /> 
                       {currentProgress && currentProgress.progress > 0 && currentProgress.progress < 100 ? 'Continuar' : 'Assistir'}
                     </Button>
                   </CardContent>
                 </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showPlayer && (
        <PlayerModal
          url={playerUrl}
          title={playerTitle}
          isOpen={showPlayer}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
};

export default SeriesDetailsPage;
