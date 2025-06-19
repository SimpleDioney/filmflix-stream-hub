
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import HeroBanner from '@/components/HeroBanner';
import ContentSection from '@/components/ContentSection';
import MediaModal from '@/components/MediaModal';
import { fetchFromTmdb } from '@/lib/tmdb';
import type { MediaItem } from '@/types/media';

const Index = () => {
  const [trendingContent, setTrendingContent] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [topRatedSeries, setTopRatedSeries] = useState<MediaItem[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadInitialContent = useCallback(async () => {
    setLoading(true);
    try {
      const [trending, movies, series, topMovies, topSeries] = await Promise.all([
        fetchFromTmdb('/trending/all/week'),
        fetchFromTmdb('/movie/popular'),
        fetchFromTmdb('/tv/popular'),
        fetchFromTmdb('/movie/top_rated'),
        fetchFromTmdb('/tv/top_rated')
      ]);

      if (trending) setTrendingContent(trending.results || []);
      if (movies) setPopularMovies(movies.results || []);
      if (series) setPopularSeries(series.results || []);
      if (topMovies) setTopRatedMovies(topMovies.results || []);
      if (topSeries) setTopRatedSeries(topSeries.results || []);
    } catch (error) {
      console.error('Erro ao carregar conteúdo inicial:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreContent = useCallback(async (endpoint: string, setter: React.Dispatch<React.SetStateAction<MediaItem[]>>) => {
    const nextPage = currentPage + 1;
    const data = await fetchFromTmdb(endpoint, `page=${nextPage}`);
    if (data?.results) {
      setter(prev => [...prev, ...data.results]);
      setCurrentPage(nextPage);
    }
  }, [currentPage]);

  const searchContent = useCallback(async (query: string, page = 1) => {
    if (!query.trim()) return;
    
    setLoading(page === 1);
    setSearchQuery(query);
    const data = await fetchFromTmdb('/search/multi', `query=${encodeURIComponent(query)}&page=${page}`);
    if (data) {
      if (page === 1) {
        setSearchResults(data.results || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.results || [])]);
      }
      setCurrentPage(page);
    }
    setLoading(false);
  }, []);

  const handleNavigation = useCallback((section: string) => {
    setActiveSection(section);
    setSearchQuery('');
    setSearchResults([]);
    setCurrentPage(1);
  }, []);

  const handleMediaSelect = useCallback((id: number, type: string) => {
    setSelectedMedia({ id, type });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setActiveSection('search');
    setCurrentPage(1);
    searchContent(query, 1);
  }, [searchContent]);

  useEffect(() => {
    loadInitialContent();
  }, [loadInitialContent]);

  const renderContent = () => {
    if (searchQuery && searchResults.length > 0) {
      return (
        <ContentSection
          title={`Resultados para: "${searchQuery}"`}
          content={searchResults}
          loading={loading}
          onMediaSelect={handleMediaSelect}
          onLoadMore={() => searchContent(searchQuery, currentPage + 1)}
          hasMore={true}
        />
      );
    }

    if (activeSection === 'movies') {
      return (
        <>
          <ContentSection
            title="Filmes Populares"
            content={popularMovies}
            loading={loading}
            onMediaSelect={handleMediaSelect}
            onLoadMore={() => loadMoreContent('/movie/popular', setPopularMovies)}
            hasMore={true}
          />
          <ContentSection
            title="Filmes Mais Bem Avaliados"
            content={topRatedMovies}
            loading={loading}
            onMediaSelect={handleMediaSelect}
          />
        </>
      );
    }

    if (activeSection === 'series') {
      return (
        <>
          <ContentSection
            title="Séries Populares"
            content={popularSeries}
            loading={loading}
            onMediaSelect={handleMediaSelect}
            onLoadMore={() => loadMoreContent('/tv/popular', setPopularSeries)}
            hasMore={true}
          />
          <ContentSection
            title="Séries Mais Bem Avaliadas"
            content={topRatedSeries}
            loading={loading}
            onMediaSelect={handleMediaSelect}
          />
        </>
      );
    }

    return (
      <>
        <HeroBanner onPlay={handleMediaSelect} />
        <div className="px-4 md:px-8 pb-8 space-y-8">
          <ContentSection
            title="Destaques da Semana"
            content={trendingContent}
            loading={loading}
            onMediaSelect={handleMediaSelect}
          />
          <ContentSection
            title="Filmes Populares"
            content={popularMovies.slice(0, 12)}
            loading={loading}
            onMediaSelect={handleMediaSelect}
          />
          <ContentSection
            title="Séries Populares"
            content={popularSeries.slice(0, 12)}
            loading={loading}
            onMediaSelect={handleMediaSelect}
          />
          <ContentSection
            title="Filmes Mais Bem Avaliados"
            content={topRatedMovies.slice(0, 12)}
            loading={loading}
            onMediaSelect={handleMediaSelect}
          />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      <Navigation activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main>
        {renderContent()}
      </main>

      {selectedMedia && (
        <MediaModal
          mediaId={selectedMedia.id}
          mediaType={selectedMedia.type}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Index;
