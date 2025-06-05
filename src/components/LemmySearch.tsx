import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { LemmyPost, ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface LemmySearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
  initialSearchTerm?: string;
}

export const LemmySearch: React.FC<LemmySearchProps> = ({ onLaunchContent, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [posts, setPosts] = useState<LemmyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      searchLemmy();
    }
  }, [initialSearchTerm]);

  const searchLemmy = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://lemmy.world/api/v3/search?q=${encodeURIComponent(searchTerm)}&type=Posts&limit=10`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Lemmy');
      }

      const data = await response.json();
      setPosts(data.posts.map((post: any) => ({
        id: post.post.id,
        title: post.post.name,
        creator: post.creator.name,
        community: post.community.name,
        published: post.post.published,
        url: post.post.url,
        score: post.counts.score,
        comments_count: post.counts.comments
      })));
    } catch (error) {
      console.error('Error searching Lemmy:', error);
      setError('Failed to fetch results from Lemmy');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchLemmy();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Lemmy..."
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
          <p className="text-primary/60">Searching Lemmy...</p>
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
                  <span>!{post.community}</span>
                  <span>@{post.creator}</span>
                  <span>
                    {format(new Date(post.published), 'yyyy-MM-dd HH:mm', { locale: enUS })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-primary/60">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {post.score}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {post.comments_count}
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
                      type: 'lemmy',
                      title: post.title,
                      description: `Posted in !${post.community} by @${post.creator}`,
                      url: post.url,
                      author: post.creator
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