
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { fetchFromTmdb } from '@/lib/tmdb';
import type { Season, Episode } from '@/types/media';

interface SeriesSelectorProps {
  seriesId: number;
  seasons: Season[];
  onEpisodeSelect: (seasonNumber: number, episodeNumber: number) => void;
}

const SeriesSelector = ({ seriesId, seasons, onEpisodeSelect }: SeriesSelectorProps) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const validSeasons = seasons.filter(season => season.season_number > 0);

  useEffect(() => {
    if (validSeasons.length > 0) {
      setSelectedSeason(validSeasons[0].season_number);
    }
  }, [validSeasons]);

  useEffect(() => {
    const loadEpisodes = async () => {
      if (selectedSeason) {
        setLoading(true);
        const seasonDetails = await fetchFromTmdb(`/tv/${seriesId}/season/${selectedSeason}`);
        if (seasonDetails && seasonDetails.episodes) {
          setEpisodes(seasonDetails.episodes);
        }
        setLoading(false);
      }
    };

    loadEpisodes();
  }, [seriesId, selectedSeason]);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-3 text-foreground">Temporadas:</h4>
        <div className="flex flex-wrap gap-2">
          {validSeasons.map((season) => (
            <Button
              key={season.season_number}
              variant={selectedSeason === season.season_number ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeason(season.season_number)}
              className={selectedSeason === season.season_number ? 
                "bg-primary text-primary-foreground" : 
                "border-border text-muted-foreground hover:text-foreground"
              }
            >
              Temporada {season.season_number}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          <h4 className="text-lg font-semibold mb-3 text-foreground">Episódios:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {episodes.map((episode) => (
              <Button
                key={episode.episode_number}
                variant="outline"
                size="sm"
                onClick={() => onEpisodeSelect(selectedSeason, episode.episode_number)}
                className="text-left justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                title={episode.name}
              >
                <span className="truncate">
                  E{episode.episode_number}: {episode.name}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesSelector;
