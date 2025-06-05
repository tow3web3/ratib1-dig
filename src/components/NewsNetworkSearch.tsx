import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Clock, Globe } from 'lucide-react';
import { ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface NewsNetworkSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
  initialSearchTerm?: string;
  network: 'cnn' | 'nbc' | 'fox';
}

export const NewsNetworkSearch: React.FC<NewsNetworkSearchProps> = ({ onLaunchContent, initialSearchTerm = '', network }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const networkConfig = {
    cnn: {
      name: 'CNN News',
      rssUrl: 'http://rss.cnn.com/rss/cnn_latest.rss',
      color: 'text-red-500'
    },
    nbc: {
      name: 'NBC News',
      rssUrl: 'https://feeds.nbcnews.com/nbcnews/public/news',
      color: 'text-purple-500'
    },
    fox: {
      name: 'FOX News',
      rssUrl: 'http://feeds.foxnews.com/foxnews/latest',
      color: 'text-blue-500'
    }
  };

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      searchNews();
    }
  }, [initialSearchTerm]);

  const searchNews = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          networkConfig[network].rssUrl
        )}&api_key=YOUR_API_KEY`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${networkConfig[network].name}`);
      }

      const data = await response.json();
      const filteredArticles = data.items?.filter((item: any) => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];
      
      setArticles(filteredArticles.slice(0, 10));
    } catch (error) {
      console.error(`Error searching ${networkConfig[network].name}:`, error);
      setError(`Failed to fetch results from ${networkConfig[network].name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchNews();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${networkConfig[network].name}...`}
            className="input flex-1"
          />
          <button
            type="submit"
            className="button-primary flex items-center gap-2"
            disabled={loading}
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="loading-pulse w-8 h-8 rounded-full mx-auto mb-2" />
          <p className="text-primary/60">Searching {networkConfig[network].name}...</p>
        </div>
      )}
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <article key={index} className="p-4 rounded-xl bg-surface-light/30 border border-border/40 hover:bg-surface-light/50 transition-colors">
            <div className="space-y-3">
              {article.thumbnail && (
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <a 
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <h3 className="text-primary group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
              </a>
              <p className="text-primary/60 line-clamp-2">{article.description}</p>
              <div className="flex justify-between items-center text-sm">
                <div className="space-x-4 text-primary/60">
                  <span className={`flex items-center gap-1 ${networkConfig[network].color}`}>
                    <Globe size={14} />
                    {networkConfig[network].name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {format(new Date(article.pubDate), 'MMM d, yyyy', { locale: enUS })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary text-sm px-3 py-1.5 flex items-center gap-1"
                >
                  View
                  <ExternalLink size={14} />
                </a>
                {onLaunchContent && (
                  <button
                    onClick={() => onLaunchContent({
                      type: network,
                      title: article.title,
                      description: article.description || `${networkConfig[network].name} article`,
                      image: article.thumbnail,
                      url: article.link,
                      author: article.author || networkConfig[network].name
                    })}
                    className="button-primary text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    Launch
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};