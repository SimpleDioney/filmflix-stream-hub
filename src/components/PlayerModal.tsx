import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlayerModalProps {
  url: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerModal = ({ url, title, isOpen, onClose }: PlayerModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (url) setIsLoading(true);
  }, [url]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[100vw] h-[100dvh] p-0 bg-black border-none overflow-hidden"
      >
        <div className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden px-4">
          {/* Acessibilidade */}
          <DialogTitle className="sr-only">{`Player para ${title}`}</DialogTitle>
          <DialogDescription className="sr-only">
            {`Conteúdo de vídeo para ${title} incorporado de uma fonte externa.`}
          </DialogDescription>

          {/* Botão de Fechar */}
          <div className="absolute top-2 right-2 z-20">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Carregamento */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Carregando player...</p>
              </div>
            </div>
          )}

          {/* Iframe com aspecto 16:9 */}
          {url && (
            <div className="w-full max-w-6xl aspect-video relative z-0">
              <iframe
                src={url}
                title={`Player para ${title}`}
                className={cn(
                  "w-full h-full border-0 rounded-md",
                  isLoading && "opacity-0"
                )}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              ></iframe>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
