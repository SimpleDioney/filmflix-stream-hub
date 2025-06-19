
import { Button } from '@/components/ui/button';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Navigation = ({ activeSection, onNavigate }: NavigationProps) => {
  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'movies', label: 'Filmes' },
    { id: 'series', label: 'Séries' },
  ];

  return (
    <nav className="bg-card border-b border-border px-4 md:px-8 py-4">
      <div className="flex justify-center gap-8">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`text-lg font-medium transition-all duration-200 ${
              activeSection === item.id
                ? 'text-primary border-b-2 border-primary bg-transparent hover:bg-transparent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
