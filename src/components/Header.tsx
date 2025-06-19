
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-strong border-b border-border px-4 md:px-8 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary uppercase tracking-wider text-shadow">
          FilmFlix
        </h1>
        
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md w-full md:w-auto">
          <Input
            type="text"
            placeholder="Buscar filmes e séries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
