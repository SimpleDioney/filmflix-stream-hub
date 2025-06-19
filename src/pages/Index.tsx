
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ContentGrid from '@/components/ContentGrid';
import MediaModal from '@/components/MediaModal';
import { fetchFromTmdb } from '@/lib/tmdb';
import type { MediaItem } from '@/types/media';

const Index = () => {
  const [content, setContent] = useState<MediaItem[]>([]);
  const [gridTitle, setGridTitle] = useState('Destaques da Semana');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: string } | null>(null);

  const loadTrending = async () => {
    setLoading(true);
    setGridTitle('Destaques da Semana');
    const data = await fetchFromTmdb('/trending/all/week');
    if (data) {
      setContent(data.results);
    }
    setLoading(false);
  };

  const loadMovies = async () => {
    setLoading(true);
    setGridTitle('Filmes Populares');
    const data = await fetchFromTmdb('/movie/popular');
    if (data) {
      setContent(data.results);
    }
    setLoading(false);
  };

  const loadSeries = async () => {
    setLoading(true);
    setGridTitle('Séries Populares');
    const data = await fetchFromTmdb('/tv/popular');
    if (data) {
      setContent(data.results);
    }
    setLoading(false);
  };

  const searchContent = async (query: string) => {
    setLoading(true);
    setGridTitle(`Resultados para: "${query}"`);
    const data = await fetchFromTmdb('/search/multi', `query=${encodeURIComponent(query)}`);
    if (data) {
      setContent(data.results);
    }
    setLoading(false);
  };

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    if (section === 'home') loadTrending();
    if (section === 'movies') loadMovies();
    if (section === 'series') loadSeries();
  };

  const handleMediaSelect = (id: number, type: string) => {
    setSelectedMedia({ id, type });
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  useEffect(() => {
    loadTrending();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={searchContent} />
      <Navigation activeSection={activeSection} onNavigate={handleNavigation} />
      
      <main className="px-4 md:px-8 pb-8">
        <h2 className="text-2xl font-bold mb-6 text-shadow">{gridTitle}</h2>
        <ContentGrid 
          content={content} 
          loading={loading} 
          onMediaSelect={handleMediaSelect}
        />
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
