import React, { useState } from 'react';
import { Search, ExternalLink, MessageSquare, Eye } from 'lucide-react';
import { BitcoinTalkPost, ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface BitcoinTalkSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
}

export const BitcoinTalkSearch: React.FC<BitcoinTalkSearchProps> = ({ onLaunchContent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<BitcoinTalkPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchBitcoinTalk = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      // Since BitcoinTalk doesn't have a public API and direct access is restricted by CORS,
      // we'll use mock data to demonstrate the functionality
      const mockPosts: BitcoinTalkPost[] = [
        {
          id: '1',
          title: `Search results for: ${searchTerm}`,
          author: 'satoshi',
          created_at: new Date().toISOString(),
          url: 'https://bitcointalk.org/index.php?topic=1',
          forum: 'Bitcoin Discussion',
          replies: 42,
          views: 1337
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error searching BitcoinTalk:', error);
      setError('BitcoinTalk search is currently unavailable due to API limitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBitcoinTalk();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search BitcoinTalk..."
            className="flex-1 px-4 py-2 bg-cyber-black border border-[#f7931a] text-[#f7931a] font-mono focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
          />
          <button
            type="submit"
            className="cyber-button px-4 py-2 flex items-center gap-2 border-[#f7931a] text-[#f7931a]"
            disabled={loading}
          >
            <Search size={16} />
            SEARCH.exe
          </button>
        </div>
      </form>

      {error && (
        <div className="text-neon-pink font-mono p-4 border border-neon-pink">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 font-mono text-[#f7931a]">
          SEARCHING_BITCOINTALK.exe...
        </div>
      )}
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="cyber-border p-4 relative group border-[#f7931a]">
            <div className="space-y-2">
              <a 
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <h3 className="font-mono text-[#f7931a] hover:text-neon-blue transition-colors">
                  {post.title}
                </h3>
              </a>
              <div className="flex justify-between items-center text-sm font-mono">
                <div className="space-x-4 text-neon-blue">
                  <span>{post.forum}</span>
                  <span>by {post.author}</span>
                  <span>
                    {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm', { locale: enUS })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#f7931a]">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {post.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {post.views}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button px-4 py-2 text-sm flex items-center gap-2 border-[#f7931a] text-[#f7931a]"
                >
                  VIEW_THREAD.exe
                  <ExternalLink size={14} />
                </a>
                {onLaunchContent && (
                  <button
                    onClick={() => onLaunchContent({
                      type: 'bitcointalk',
                      title: post.title,
                      description: `Posted in ${post.forum} by ${post.author}`,
                      url: post.url,
                      author: post.author
                    })}
                    className="cyber-button px-4 py-2 text-sm flex items-center gap-2"
                  >
                    LAUNCH.exe
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