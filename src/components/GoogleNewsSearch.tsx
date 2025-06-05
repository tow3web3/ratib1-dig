import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Clock, Globe } from 'lucide-react';
import { ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface GoogleNewsSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
  initialSearchTerm?: string;
}

export const GoogleNewsSearch: React.FC<GoogleNewsSearchProps> = ({ onLaunchContent, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      searchGoogleNews();
    }
  }, [initialSearchTerm]);

  const searchGoogleNews = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm)}&hl=en-US&gl=US&ceid=US:en`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Google News');
      }

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = Array.from(xml.querySelectorAll('item')).map(item => ({
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        description: item.querySelector('description')?.textContent || '',
        source: item.querySelector('source')?.textContent || 'Google News'
      }));

      setArticles(items);
    } catch (error) {
      console.error('Error searching Google News:', error);
      setError('Failed to fetch results from Google News');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchGoogleNews();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Google News..."
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
          <p className="text-primary/60">Searching Google News...</p>
        </div>
      )}
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <article key={index} className="p-4 rounded-xl bg-surface-light/30 border border-border/40 hover:bg-surface-light/50 transition-colors">
            <div className="space-y-3">
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
                  <span className="flex items-center gap-1">
                    <Globe size={14} />
                    {article.source}
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
                      type: 'google',
                      title: article.title,
                      description: article.description,
                      url: article.link,
                      author: article.source
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