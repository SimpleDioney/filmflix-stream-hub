import { useState, useEffect } from 'react';
import { Filter, X, Star, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApi } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

interface Genre {
  id: number;
  name: string;
}

interface FilterOptions {
  genre?: string;
  year?: string;
  rating?: number[];
  type?: string;
  sortBy?: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export const FilterPanel = ({ isOpen, onClose, onFiltersChange, className }: FilterPanelProps) => {
  const api = useApi();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    genre: 'all',
    year: 'all',
    rating: [0],
    type: 'all',
    sortBy: 'popularity.desc',
  });

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters]); // Removeu onFiltersChange das dependências para evitar loop

  const loadGenres = async () => {
    try {
      const data = await api.genres();
      setGenres(data || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      genre: 'all',
      year: 'all',
      rating: [0],
      type: 'all',
      sortBy: 'popularity.desc',
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      className
    )}>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6 overflow-y-auto pb-20">
            {/* Tipo de Conteúdo */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Tipo de Conteúdo</h3>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="movie">Filmes</SelectItem>
                  <SelectItem value="tv">Séries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gênero */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Gênero</h3>
              <Select value={filters.genre} onValueChange={(value) => updateFilter('genre', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gêneros</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Ano</h3>
              <Select value={filters.year} onValueChange={(value) => updateFilter('year', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Avaliação Mínima */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Avaliação Mínima</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{filters.rating?.[0] || 0}/10</span>
                </div>
              </div>
              <Slider
                value={filters.rating || [0]}
                onValueChange={(value) => updateFilter('rating', value)}
                max={10}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Ordenar Por */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Ordenar Por</h3>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity.desc">Popularidade (Maior)</SelectItem>
                  <SelectItem value="popularity.asc">Popularidade (Menor)</SelectItem>
                  <SelectItem value="vote_average.desc">Melhores Avaliados</SelectItem>
                  <SelectItem value="vote_average.asc">Piores Avaliados</SelectItem>
                  <SelectItem value="release_date.desc">Mais Recentes</SelectItem>
                  <SelectItem value="release_date.asc">Mais Antigos</SelectItem>
                  <SelectItem value="title.asc">A-Z</SelectItem>
                  <SelectItem value="title.desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros Ativos */}
            {(filters.genre !== 'all' || filters.year !== 'all' || (filters.rating && filters.rating[0] > 0) || filters.type !== 'all') && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Filtros Ativos</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.type !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.type === 'movie' ? 'Filmes' : 'Séries'}
                    </Badge>
                  )}
                  {filters.genre !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {genres.find(g => g.id.toString() === filters.genre)?.name}
                    </Badge>
                  )}
                  {filters.year !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {filters.year}
                    </Badge>
                  )}
                  {filters.rating && filters.rating[0] > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      ⭐ {filters.rating[0]}+
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          {/* Ações */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Limpar Filtros
              </Button>
              <Button onClick={onClose} className="flex-1">
                Aplicar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};