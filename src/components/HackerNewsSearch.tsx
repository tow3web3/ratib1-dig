import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { HackerNewsPost, ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface HackerNewsSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
  initialSearchTerm?: string;
}

export const HackerNewsSearch: React.FC<HackerNewsSearchProps> = ({ onLaunchContent, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [posts, setPosts] = useState<HackerNewsPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      searchHackerNews();
    }
  }, [initialSearchTerm]);

  const searchHackerNews = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(searchTerm)}&tags=story`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Hacker News');
      }

      const data = await response.json();
      setPosts(data.hits.map((hit: any) => ({
        id: hit.objectID,
        title: hit.title,
        by: hit.author,
        time: hit.created_at_i,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        score: hit.points,
        descendants: hit.num_comments
      })));
    } catch (error) {
      console.error('Error searching Hacker News:', error);
      setError('Failed to fetch results from Hacker News');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchHackerNews();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Hacker News..."
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
          <p className="text-primary/60">Searching Hacker News...</p>
        </div>
      )}
      
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="p-4 rounded-xl bg-surface-light/30 border border-border/40 hover:bg-surface-light/50 transition-colors">
            <div className="space-y-3">
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <h3 className="text-primary group-hover:text-accent transition-colors">
                  {post.title}
                </h3>
              </a>
              <div className="flex justify-between items-center text-sm">
                <div className="space-x-4 text-primary/60">
                  <span>by {post.by}</span>
                  <span>
                    {format(new Date(post.time * 1000), 'yyyy-MM-dd HH:mm', { locale: enUS })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-primary/60">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {post.score}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {post.descendants}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={post.url}
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
                      type: 'hackernews',
                      title: post.title,
                      description: `Posted by ${post.by}`,
                      url: post.url,
                      author: post.by
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