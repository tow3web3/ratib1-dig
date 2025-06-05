import React, { useState } from 'react';
import { Search, ExternalLink, MessageSquare, Image } from 'lucide-react';
import { FourChanPost, ContentToLaunch } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { decode } from 'html-entities';

interface FourChanSearchProps {
  onLaunchContent?: (content: ContentToLaunch) => void;
}

export const FourChanSearch: React.FC<FourChanSearchProps> = ({ onLaunchContent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [board, setBoard] = useState('biz');
  const [posts, setPosts] = useState<FourChanPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const boards = ['biz', 'g', 'pol', 'b', 'a', 'v', 'vg', 'sci', 'his', 'int'];

  const searchFourChan = async () => {
    if (!searchTerm.trim() || !board) return;
    
    setLoading(true);
    setError('');
    try {
      // Add retries for robustness
      let retries = 3;
      let response;
      
      while (retries > 0) {
        try {
          // Use the proxied endpoint
          response = await fetch(`/4chan/${board}/catalog.json`);
          
          if (response.ok) break;
          
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        } catch (e) {
          retries--;
          if (retries === 0) throw e;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch from 4chan (HTTP ${response?.status || 'unknown'})`);
      }

      const data = await response.json();
      const allThreads = data.flatMap((page: any) => page.threads);
      
      const filteredThreads = allThreads
        .filter((thread: any) => {
          const subject = thread.sub?.toLowerCase() || '';
          const comment = thread.com?.toLowerCase() || '';
          const searchLower = searchTerm.toLowerCase();
          return subject.includes(searchLower) || comment.includes(searchLower);
        })
        .slice(0, 10)
        .map((thread: any) => ({
          no: thread.no,
          time: thread.time,
          sub: thread.sub || '',
          com: thread.com || '',
          name: thread.name || 'Anonymous',
          board: board,
          replies: thread.replies || 0,
          images: thread.images || 0
        }));

      setPosts(filteredThreads);
      
      if (filteredThreads.length === 0) {
        setError('No results found. Try a different search term or board.');
      }
    } catch (error) {
      console.error('Error searching 4chan:', error);
      setError(
        error instanceof Error 
          ? `Failed to fetch results: ${error.message}. Please try again later.` 
          : 'Failed to fetch results. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchFourChan();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="flex gap-2">
          <select
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            className="px-4 py-2 bg-cyber-black border border-neon-green text-neon-green font-mono focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
          >
            {boards.map(b => (
              <option key={b} value={b}>/{b}/</option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 4chan..."
            className="flex-1 px-4 py-2 bg-cyber-black border border-neon-green text-neon-green font-mono focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
          />
          <button
            type="submit"
            className="cyber-button px-4 py-2 flex items-center gap-2"
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
        <div className="text-center py-4 font-mono text-neon-green">
          SEARCHING_4CHAN.exe...
        </div>
      )}
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.no} className="cyber-border p-4 relative group">
            <div className="space-y-2">
              <div className="font-mono text-neon-green">
                {post.sub && (
                  <h3 className="text-lg mb-2">{decode(post.sub)}</h3>
                )}
                {post.com && (
                  <div 
                    className="text-sm opacity-80"
                    dangerouslySetInnerHTML={{ 
                      __html: decode(post.com).substring(0, 300) + (post.com.length > 300 ? '...' : '')
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between items-center text-sm font-mono">
                <div className="space-x-4 text-neon-blue">
                  <span>{post.name}</span>
                  <span>/{post.board}/</span>
                  <span>
                    {format(new Date(post.time * 1000), 'yyyy-MM-dd HH:mm', { locale: enUS })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-neon-green">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {post.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <Image size={14} />
                    {post.images}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://boards.4channel.org/${post.board}/thread/${post.no}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button px-4 py-2 text-sm flex items-center gap-2"
                >
                  VIEW_THREAD.exe
                  <ExternalLink size={14} />
                </a>
                {onLaunchContent && (
                  <button
                    onClick={() => onLaunchContent({
                      type: '4chan',
                      title: post.sub || `Thread #${post.no}`,
                      description: post.com ? decode(post.com).substring(0, 200) : `Thread in /${post.board}/`,
                      url: `https://boards.4channel.org/${post.board}/thread/${post.no}`,
                      author: post.name
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