import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';

interface TikTokModalProps {
  onClose: () => void;
}

interface TikTokFeed {
  id: string;
  name: string;
  appId: string;
}

const TIKTOK_FEEDS: TikTokFeed[] = [
  { id: 'cat', name: '#CAT', appId: '3bf6bee6-df51-42a6-b3de-6f724c3b679f' },
  { id: 'dog', name: '#DOG', appId: '9e78230c-aea2-49ab-89b4-8334a786af60' },
  { id: 'viral', name: '#VIRAL', appId: '87e96758-4481-4fc0-8b0c-ceab0958e22d' },
  { id: 'trend', name: '#TREND', appId: '318f16a1-abb4-436f-8a1b-74530c0879b2' },
  { id: 'meme', name: '#MEME', appId: 'f66dde11-b596-4553-a21c-035353e98ee5' },
  { id: 'troll', name: '#TROLL', appId: '57cac561-c267-4b5f-aa83-c602b68cbdee' }
];

declare global {
  interface Window {
    ElfsightApp?: {
      reload: (appId: string) => void;
    };
  }
}

export const TikTokModal: React.FC<TikTokModalProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedFeed, setSelectedFeed] = useState<TikTokFeed>(TIKTOK_FEEDS[0]);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!modalRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - (modalRef.current?.offsetWidth || 0)));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - (modalRef.current?.offsetHeight || 0)));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag as any);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag as any);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    // Reinitialize Elfsight widget when feed changes
    const timer = setTimeout(() => {
      if (window.ElfSight?.reload) {
        window.ElfSight.reload(`elfsight-app-${selectedFeed.appId}`);
      } else {
        // If reload function is not available, recreate the script
        const oldScript = document.querySelector('script[src*="elfsight"]');
        if (oldScript) {
          oldScript.remove();
        }
        const script = document.createElement('script');
        script.src = 'https://static.elfsight.com/platform/platform.js';
        script.defer = true;
        document.body.appendChild(script);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedFeed]);

  return (
    <div 
      ref={modalRef}
      className="fixed bg-white rounded-lg shadow-2xl z-50 w-[360px] transition-transform"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      <div 
        className="p-3 border-b flex items-center justify-between cursor-move bg-accent text-white"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png"
            alt="TikTok"
            className="w-5 h-5 object-contain"
          />
          <h2 className="text-lg font-serif font-bold">TREND ON TIKTOK</h2>
          <GripHorizontal size={16} className="opacity-50" />
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TIKTOK_FEEDS.map(feed => (
            <button
              key={feed.id}
              onClick={() => setSelectedFeed(feed)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                selectedFeed.id === feed.id
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {feed.name}
            </button>
          ))}
        </div>

        <div className="h-[480px] overflow-hidden">
          <div 
            key={selectedFeed.appId} 
            className={`elfsight-app-${selectedFeed.appId}`} 
            data-elfsight-app-lazy
          />
        </div>
      </div>
    </div>
  );
};