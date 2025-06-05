import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSupabaseClient } from '../lib/supabaseClient';
import { User, Trophy, UserCircle, BarChart2, GripHorizontal, X } from 'lucide-react';
import { MetaAnalyzer } from './MetaAnalyzer';
import { TikTokModal } from './TikTokModal';
import { CONTRACT_ADDRESS } from '../constants';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [showChartModal, setShowChartModal] = useState(false);
  const [showMetaAnalyzer, setShowMetaAnalyzer] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [chartPosition, setChartPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 480));
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 360));
        setChartPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <header className="bg-surface border-b-2 border-primary sticky top-0 z-50">
      <div className="container py-3">
        {/* TikTok Stamp */}
        <button
          onClick={() => setShowTikTokModal(true)}
          className="absolute top-12 left-4 transform -rotate-12 bg-accent text-white font-serif font-bold px-6 py-3 rounded shadow-lg hover:rotate-0 transition-all duration-300 z-50 flex items-center gap-2"
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
          }}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png"
            alt="TikTok"
            className="w-5 h-5 object-contain"
          />
          TREND ON TIKTOK
        </button>

        {/* Meta PF Analyzer Button */}
        <div className="text-center mb-2">
          <button
            onClick={() => setShowMetaAnalyzer(true)}
            className="vintage-button px-8 py-2 flex items-center gap-2 mx-auto group hover:bg-accent hover:text-white hover:border-accent transition-all duration-200"
          >
            <BarChart2 className="w-5 h-5" />
            <span className="font-serif font-bold tracking-wider">META PF ANALYZER!</span>
            <img 
              src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
              alt="Pump.fun"
              className="w-5 h-5 object-contain"
            />
            <span className="text-xs font-mono opacity-60">EXTRA! EXTRA!</span>
          </button>
        </div>

        {/* Masthead */}
        <div className="text-center mb-3">
          <button onClick={() => navigate('/app')} className="inline-block">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-surface rounded-full p-0.5 border-2 border-primary flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src="https://i.imgur.com/eI2mqrS.png"
                    alt="THE SCOOP FINDER"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h1 className="newspaper-title text-3xl md:text-4xl mb-1 hover:text-accent transition-colors">
                THE SCOOP FINDER
              </h1>
            </div>
          </button>
          <div className="vintage-divider my-2"></div>
          <p className="text-text-light italic font-body text-sm">
            "All the Token News That's Fit to Launch" - {currentDate}
          </p>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-center border-t-2 border-b-2 border-primary py-2">
          <nav className="flex items-center">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className={`flex items-center gap-1.5 font-serif text-base transition-colors ${
                  location.pathname === '/'
                    ? 'text-accent'
                    : 'hover:text-accent'
                }`}
              >
                <img 
                  src="https://i.ibb.co/DfZ7cGwR/icons8-front-view-100.png"
                  alt="Front Page"
                  className="w-5 h-5 object-contain"
                />
                Front Page
              </Link>
              <Link
                to="/guide"
                className={`flex items-center gap-1.5 font-serif text-base transition-colors ${
                  location.pathname === '/guide'
                    ? 'text-accent'
                    : 'hover:text-accent'
                }`}
              >
                <img 
                  src="https://i.ibb.co/FbMxhfw3/icons8-ereader-48.png"
                  alt="Guide"
                  className="w-5 h-5 object-contain"
                />
                Launch Guide
              </Link>
              <Link
                to="/tokenomics"
                className={`flex items-center gap-1.5 font-serif text-base transition-colors ${
                  location.pathname === '/tokenomics'
                    ? 'text-accent'
                    : 'hover:text-accent'
                }`}
              >
                <img 
                  src="https://i.ibb.co/DDSjRxyN/icons8-token-64.png"
                  alt="Tokenomics"
                  className="w-5 h-5 object-contain"
                />
                Tokenomics
              </Link>
              <button
                onClick={() => setShowChartModal(true)}
                className="flex items-center gap-1.5 font-serif text-base hover:text-accent transition-colors"
              >
                <img 
                  src="https://i.imgur.com/4w2jTUY.png"
                  alt="Chart"
                  className="w-5 h-5 object-contain"
                />
                Chart
              </button>
              <Link
                to="/buy"
                className={`flex items-center gap-1.5 font-serif text-base transition-colors ${
                  location.pathname === '/buy'
                    ? 'text-accent'
                    : 'hover:text-accent'
                }`}
              >
                <img 
                  src="https://i.imgur.com/mEtkV30.png"
                  alt="Buy"
                  className="w-5 h-5 object-contain"
                />
                $SCOOP
              </Link>
              <Link
                to="/app"
                className={`flex items-center gap-1.5 font-serif text-base transition-colors ${
                  location.pathname === '/app'
                    ? 'text-accent'
                    : 'hover:text-accent'
                }`}
              >
                <img 
                  src="https://i.imgur.com/Kw6itOm.png" 
                  alt="Launchpad"
                  className="w-5 h-5 object-contain"
                />
                Launchpad
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`flex items-center gap-1.5 font-serif text-base transition-colors ${
                    showMoreMenu ? 'text-accent' : 'hover:text-accent'
                  }`}
                >
                  <img 
                    src="https://i.imgur.com/UeBQlgx.png"
                    alt="More"
                    className="w-5 h-5 object-contain"
                  />
                  More
                </button>
                
                {showMoreMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-surface border-2 border-primary shadow-lg rounded-lg overflow-hidden">
                    <div className="p-2 space-y-1">
                      <Link
                        to="/forum"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-surface-light rounded transition-colors"
                      >
                        <img 
                          src="https://i.imgur.com/w8SDJqx.png"
                          alt="Forum"
                          className="w-4 h-4 object-contain"
                        />
                        Forum
                      </Link>
                      <Link
                        to="/leaderboard"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-surface-light rounded transition-colors"
                      >
                        <img 
                          src="https://i.imgur.com/3vNXJ4x.png"
                          alt="Leaderboard"
                          className="w-4 h-4 object-contain"
                        />
                        Launcherboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-surface-light rounded transition-colors"
                      >
                        <UserCircle size={16} />
                        My Profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 ml-4">
                <a
                  href="https://x.com/thediggerherald"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:text-accent transition-colors"
                >
                  <img 
                    src="https://i.imgur.com/CDFBXt3.png"
                    alt="X (Twitter)"
                    className="w-4 h-4 object-contain"
                  />
                </a>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {showMetaAnalyzer && (
        <MetaAnalyzer onClose={() => setShowMetaAnalyzer(false)} />
      )}

      {showTikTokModal && <TikTokModal onClose={() => setShowTikTokModal(false)} />}

      {/* Chart Modal */}
      {showChartModal && (
        <div 
          className="fixed bg-surface rounded-lg shadow-2xl z-50 w-[480px]"
          style={{ 
            top: `${chartPosition.y}px`, 
            left: `${chartPosition.x}px`,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s'
          }}
        >
          <div 
            className="p-4 border-b-2 border-primary flex items-center justify-between cursor-move"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
              setDragStart({
                x: e.clientX - chartPosition.x,
                y: e.clientY - chartPosition.y
              });
            }}
          >
            <div className="flex items-center gap-3">
              <img 
                src="https://i.imgur.com/4w2jTUY.png"
                alt="Chart"
                className="w-5 h-5 object-contain"
              />
              <h3 className="text-xl font-serif font-bold">Price Chart</h3>
              <GripHorizontal size={16} className="text-primary/40" />
            </div>
            <button
              onClick={() => setShowChartModal(false)}
              className="text-primary hover:text-accent transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="aspect-video">
            <iframe
              src={`https://birdeye.so/tv-widget/${CONTRACT_ADDRESS}?chain=solana&viewMode=pair&chartInterval=1D&chartType=CANDLE&chartTimezone=Asia%2FSingapore&chartLeftToolbar=show&theme=dark`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </header>
  );
};