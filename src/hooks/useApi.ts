import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useMemo } from 'react';

const API_BASE_URL = 'https://vps60023.publiccloud.com.br/movie'; // Garanta que esta é a porta correta

export const useApi = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        
        if (response.status === 401) {
          localStorage.removeItem('megaflix_token');
          localStorage.removeItem('megaflix_user');
          window.location.reload();
          return;
        }
        
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro de API",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [token, toast]);

  // useMemo garante que o objeto com as funções da API não seja recriado em cada renderização
  return useMemo(() => ({
    discover: () => apiCall('/api/discover'),
    search: (query: string, type: string = 'multi', page = 1) => 
      apiCall(`/api/search?query=${encodeURIComponent(query)}&type=${type}&page=${page}`),
    genres: () => apiCall('/api/genres'),
    discoverMedia: (filters: any = {}) => {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.genreId) params.append('genreId', filters.genreId.toString());
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
      const queryString = params.toString();
      return apiCall(`/api/discover/media${queryString ? `?${queryString}` : ''}`);
    },
    movieDetails: (id: number) => apiCall(`/api/movie/${id}`),
    tvDetails: (id: number) => apiCall(`/api/tv/${id}`),
    tvSeasonDetails: (seriesId: number, seasonNumber: number) => apiCall(`/api/tv/${seriesId}/season/${seasonNumber}`),
    personDetails: (id: number) => apiCall(`/api/person/${id}`),
    getMyList: () => apiCall('/api/my-list'),
    toggleMyList: (item: {
      tmdb_id: number;
      item_type: string;
      poster_path: string;
      title: string;
    }) => apiCall('/api/my-list', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
    
    getHistory: () => apiCall('/api/history'),
    updateHistory: (item: {
      tmdb_id: number;
      item_type: string;
      poster_path: string;
      title: string;
      progress: number;
      season_number?: number;
      episode_number?: number;
    }) => apiCall('/api/history', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
    call: apiCall,
  }), [apiCall]);
};