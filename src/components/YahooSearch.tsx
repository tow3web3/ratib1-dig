import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Clock, Globe } from 'lucide-react';
import { ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface YahooSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
  initialSearchTerm?: string;
}

export const YahooSearch: React.FC<YahooSearchProps> = ({ onLaunchContent, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      searchYahoo();
    }
  }, [initialSearchTerm]);

  const parseXMLResponse = (xmlText: string) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    
    return Array.from(xml.querySelectorAll('item')).map(item => ({
      title: item.querySelector('title')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      url: item.querySelector('link')?.textContent || '',
      publishedAt: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
      urlToImage: item.querySelector('media\\:content, content')?.getAttribute('url') || null,
      author: item.querySelector('author')?.textContent || 'Yahoo News'
    }));
  };

  const searchYahoo = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'yahoo',
          query: searchTerm
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Yahoo News');
      }

      const xmlText = await response.text();
      const parsedArticles = parseXMLResponse(xmlText);
      setArticles(parsedArticles);
    } catch (error) {
      console.error('Error searching Yahoo News:', error);
      setError('Failed to fetch results from Yahoo News');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchYahoo();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Yahoo News..."
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
          <p className="text-primary/60">Searching Yahoo News...</p>
        </div>
      )}
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <article key={index} className="p-4 rounded-xl bg-surface-light/30 border border-border/40 hover:bg-surface-light/50 transition-colors">
            <div className="space-y-3">
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <a 
                href={article.url}
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
                  <span className="flex items-center gap-1">
                    <Globe size={14} />
                    Yahoo News
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {format(new Date(article.publishedAt), 'MMM d, yyyy', { locale: enUS })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={article.url}
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
                      type: 'yahoo',
                      title: article.title,
                      description: article.description || 'Yahoo News article',
                      image: article.urlToImage,
                      url: article.url,
                      author: article.author || 'Yahoo News'
                    })}
                    className="button-primary text-sm px-3 py-1.5 flex items-center gap-1"
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
          </article>
        ))}
      </div>
    </div>
  );
};