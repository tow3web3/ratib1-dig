import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ContentToLaunch } from '../types';

interface FeedItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  image?: string;
}

interface KeywordFeedProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
}

const RSS_FEEDS = [
  {
    url: 'https://rss.app/feeds/hdTDDQfw1awbcYCM.xml',
    name: 'Yahoo News'
  },
  {
    url: 'https://rss.app/feeds/DEFPqJpJyhErApW4.xml',
    name: 'Justice on X'
  },
  {
    url: 'https://rss.app/feeds/kimg9UMJ94jRp38A.xml',
    name: 'Javier Milei on X'
  },
  {
    url: 'https://rss.app/feeds/9OiyNjL0tH4PydLj.xml',
    name: 'Donald Trump on X'
  },
  {
    url: 'https://rss.app/feeds/Arn9GqTpvD6JRnXS.xml',
    name: 'Elon Musk on X'
  },
  {
    url: 'https://rss.app/feeds/sZvOHnydfBPjPiLr.xml',
    name: 'pumpfun on X'
  },
  {
    url: 'https://rss.app/feeds/JEeLkA6PKKCkXR7V.xml',
    name: '#Coin on X'
  },
  {
    url: 'https://rss.app/feeds/jlz7djRpFoqwfdXI.xml',
    name: '#dog on X'
  },
  {
    url: 'https://rss.app/feeds/kcaMYYXkTY30y9AQ.xml',
    name: '#jail on X'
  },
  {
    url: 'https://rss.app/feeds/3GgFpwRdGnGe7OpI.xml',
    name: 'Trump Jr., Donald on X'
  },
  {
    url: 'https://rss.app/feeds/bszHkylNfyGx9dDS.xml',
    name: '#solana on X'
  }
];

export const KeywordFeed: React.FC<KeywordFeedProps> = ({ onLaunchContent }) => {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastUpdateRef = useRef<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>(RSS_FEEDS.map(feed => feed.name));

  const fetchFeeds = async () => {
    try {
      setIsUpdating(true);
      const feedPromises = RSS_FEEDS
        .filter(feed => selectedFeeds.includes(feed.name))
        .map(async (feed) => {
          try {
            const response = await fetch(feed.url);
            if (!response.ok) {
              console.warn(`Failed to fetch ${feed.name}: ${response.status}`);
              return [];
            }
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            
            return Array.from(xml.querySelectorAll('item')).map(item => {
              const mediaContent = item.querySelector('media\\:content, content');
              const enclosure = item.querySelector('enclosure');
              const image = mediaContent?.getAttribute('url') || 
                           enclosure?.getAttribute('url') || 
                           item.querySelector('image')?.textContent || 
                           undefined;

              return {
                title: item.querySelector('title')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
                source: feed.name,
                pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                image: image && isValidImageUrl(image) ? image : undefined
              };
            });
          } catch (error) {
            console.warn(`Error fetching ${feed.name}:`, error);
            return [];
          }
        });

      const results = await Promise.all(feedPromises);
      const newFeeds = results.flat().sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      if (JSON.stringify(newFeeds) !== JSON.stringify(feeds)) {
        setFeeds(newFeeds);
        lastUpdateRef.current = new Date();
      }

      setError('');
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setError('Unable to update some feeds. Retrying...');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const ext = urlObj.pathname.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 30000);
    return () => clearInterval(interval);
  }, [selectedFeeds]);

  const handleLaunch = (item: FeedItem) => {
    if (onLaunchContent) {
      onLaunchContent({
        type: 'rss',
        title: item.title,
        description: `From ${item.source}`,
        url: item.link,
        author: item.source,
        image: item.image
      });
    }
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdateRef.current.getTime()) / 1000);
    return `${seconds}s ago`;
  };

  const toggleFeed = (feedName: string) => {
    setSelectedFeeds(prev => {
      if (prev.includes(feedName)) {
        return prev.filter(name => name !== feedName);
      } else {
        return [...prev, feedName];
      }
    });
  };

  const selectAllFeeds = () => {
    setSelectedFeeds(RSS_FEEDS.map(feed => feed.name));
  };

  const deselectAllFeeds = () => {
    setSelectedFeeds([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 p-3 rounded-xl">
            <img 
              src="https://i.ibb.co/cSh70mTg/icons8-live-64.png"
              alt="Live Feed"
              className={`w-5 h-5 ${isUpdating ? 'animate-pulse' : ''}`}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Live Feed</h2>
            <p className="text-sm text-primary/60">
              Updated {getTimeSinceUpdate()}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="button-secondary p-2"
          title="Toggle feed filters"
        >
          <Filter size={20} />
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-surface-light/30 rounded-xl border border-border/40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-primary">Feed Filters</h3>
            <div className="space-x-2">
              <button
                onClick={selectAllFeeds}
                className="button-secondary text-xs px-2 py-1"
              >
                Select All
              </button>
              <button
                onClick={deselectAllFeeds}
                className="button-secondary text-xs px-2 py-1"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {RSS_FEEDS.map(feed => (
              <button
                key={feed.name}
                onClick={() => toggleFeed(feed.name)}
                className={`p-2 text-sm text-left rounded transition-colors ${
                  selectedFeeds.includes(feed.name)
                    ? 'bg-accent text-white'
                    : 'bg-surface-light/50 text-primary/60'
                }`}
              >
                {feed.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-neon-pink font-mono p-4 border border-neon-pink">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="loading-pulse w-8 h-8 rounded-full mx-auto mb-2" />
          <p className="text-sm text-primary/60">Loading feeds...</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4">
        <div className="space-y-4">
          {feeds.map((item, index) => (
            <div
              key={`${item.link}-${index}`}
              className="p-4 rounded-xl bg-surface-light/30 border border-border/40 hover:bg-surface-light/50 transition-colors"
            >
              <div className="space-y-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <h4 className="text-sm font-medium text-primary line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary/60">{item.source}</span>
                  <span className="text-primary/60">
                    {format(new Date(item.pubDate), 'HH:mm:ss')}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  View
                  <ExternalLink size={12} />
                </a>
                {onLaunchContent && (
                  <button
                    onClick={() => handleLaunch(item)}
                    className="button-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    Launch
                    <img 
                      src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                      alt="Launch"
                      className="w-4 h-4 object-contain"
                    />
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && feeds.length === 0 && (
            <div className="p-4 text-center text-primary/60 text-sm">
              No feeds available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};