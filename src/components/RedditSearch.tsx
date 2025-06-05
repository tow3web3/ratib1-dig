import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Calendar, SortAsc, Filter, MoreHorizontal } from 'lucide-react';
import { RedditPost, ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface RedditSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
  initialSearchTerm?: string;
}

export const RedditSearch: React.FC<RedditSearchProps> = ({ onLaunchContent, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [after, setAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [subreddit, setSubreddit] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    if (initialSearchTerm) {
      searchReddit();
    }
  }, [initialSearchTerm]);

  const getTimeFilterParam = () => {
    switch (timeFilter) {
      case 'day': return 'day';
      case 'week': return 'week';
      case 'month': return 'month';
      case 'year': return 'year';
      default: return 'all';
    }
  };

  const isValidThumbnail = (thumbnail: string): boolean => {
    return (
      thumbnail &&
      thumbnail !== 'self' &&
      thumbnail !== 'default' &&
      thumbnail !== 'nsfw' &&
      thumbnail !== 'image' &&
      thumbnail !== 'spoiler' &&
      thumbnail.startsWith('http')
    );
  };

  const searchReddit = async (loadMore = false) => {
    if (!searchTerm.trim()) return;
    
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPosts([]);
      setAfter(null);
    }

    try {
      const subredditParam = subreddit ? `subreddit:${subreddit} ` : '';
      const searchQuery = `${subredditParam}${searchTerm}`;
      const timeParam = getTimeFilterParam();
      const afterParam = loadMore && after ? `&after=${after}` : '';
      
      const response = await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(searchQuery)}&sort=${sortBy}&t=${timeParam}&limit=10${afterParam}`
      );
      const data = await response.json();
      
      const newPosts = data.data.children.map((child: any) => {
        let thumbnail = child.data.thumbnail;
        let preview = child.data.preview?.images?.[0]?.source?.url;
        
        // Use preview image if available and thumbnail is not valid
        if (!isValidThumbnail(thumbnail) && preview) {
          thumbnail = preview.replace(/&amp;/g, '&');
        }

        return {
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          created_utc: child.data.created_utc,
          subreddit: child.data.subreddit,
          url: child.data.url,
          thumbnail: isValidThumbnail(thumbnail) ? thumbnail : null,
          score: child.data.score
        };
      });

      if (loadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setAfter(data.data.after);
      setHasMore(!!data.data.after);
    } catch (error) {
      console.error('Error searching Reddit:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchReddit();
  };

  const handleLoadMore = () => {
    searchReddit(true);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Reddit..."
            className="input flex-1"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="button-secondary px-3"
            title="Toggle filters"
          >
            <Filter size={16} />
          </button>
          <button
            type="submit"
            className="button-primary flex items-center gap-2"
            disabled={loading}
          >
            <Search size={16} />
            Search
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface-light/30 rounded-xl border border-border/40">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All Time</option>
                <option value="day">Past 24 Hours</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="hot">Hot</option>
                <option value="top">Top</option>
                <option value="new">New</option>
                <option value="comments">Comments</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">Subreddit</label>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                placeholder="e.g., cryptocurrency"
                className="input text-sm"
              />
            </div>
          </div>
        )}
      </form>

      {loading && (
        <div className="text-center py-4">
          <div className="loading-pulse w-8 h-8 rounded-full mx-auto mb-2" />
          <p className="text-primary/60">Searching Reddit...</p>
        </div>
      )}
      
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="p-4 rounded-xl bg-surface-light/30 border border-border/40 hover:bg-surface-light/50 transition-colors">
            <div className="flex gap-4">
              {post.thumbnail && (
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg"
                >
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </a>
              )}
              <div className="flex-1">
                <a 
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-primary group-hover:text-accent transition-colors mb-2">
                    {post.title}
                  </h3>
                </a>
                <div className="flex justify-between items-center text-sm">
                  <div className="space-x-4 text-primary/60">
                    <span>r/{post.subreddit}</span>
                    <span>u/{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(post.created_utc * 1000), 'MMM d, yyyy', { locale: enUS })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-primary/60">
                    <SortAsc size={14} />
                    {post.score} points
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
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
                        type: 'reddit',
                        title: post.title,
                        description: `Posted in r/${post.subreddit} by u/${post.author}`,
                        image: post.thumbnail,
                        url: post.url,
                        author: post.author
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
            </div>
          </article>
        ))}

        {posts.length > 0 && hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="button-secondary flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <div className="loading-pulse w-4 h-4 rounded-full" />
                  Loading More...
                </>
              ) : (
                <>
                  <MoreHorizontal size={16} />
                  Load More
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};