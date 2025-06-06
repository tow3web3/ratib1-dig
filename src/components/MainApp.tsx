import React, { useState, useEffect } from 'react';
import { RedditSearch } from './RedditSearch';
import { HackerNewsSearch } from './HackerNewsSearch';
import { LemmySearch } from './LemmySearch';
import TokenLaunch from './TokenLaunch';
import { KeywordFeed } from './KeywordFeed';
import { ContentToLaunch } from '../types';

const SUGGESTED_KEYWORDS = [
  'Old token',
  'OG token',
  'Trump',
  'Tarif Trump',
  'AI',
  'Doge',
  'Elon Musk',
  'Solana'
];

export const MainApp: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<ContentToLaunch | undefined>();
  const [redditSearchTerm, setRedditSearchTerm] = useState('');
  const [hackerNewsSearchTerm, setHackerNewsSearchTerm] = useState('');
  const [lemmySearchTerm, setLemmySearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLaunchContent = (content: ContentToLaunch) => {
    setSelectedContent(content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Token Launch Section */}
          <div className="vintage-border p-8 mb-8">
            <TokenLaunch selectedContent={selectedContent} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Section */}
            <div className="space-y-8">
              {/* Reddit Section */}
              <div className="vintage-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://www.reddiquette.com/wp-content/uploads/2020/09/What-Is-The-Reddit-Logo-Called.png"
                    alt="Reddit"
                    className="w-6 h-6 object-contain"
                  />
                  <h2 className="text-xl font-serif font-bold text-primary">Reddit</h2>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {SUGGESTED_KEYWORDS.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setRedditSearchTerm(keyword)}
                      className="px-3 py-1.5 bg-surface text-primary text-sm border-2 border-primary hover:bg-surface-light transition-colors font-body"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                <RedditSearch onLaunchContent={handleLaunchContent} initialSearchTerm={redditSearchTerm} />
              </div>

              {/* Hacker News Section */}
              <div className="vintage-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://w7.pngwing.com/pngs/738/777/png-transparent-computer-icons-hacker-news-intelligent-miscellaneous-angle-text-thumbnail.png"
                    alt="Hacker News"
                    className="w-6 h-6 object-contain"
                  />
                  <h2 className="text-xl font-serif font-bold text-primary">Hacker News</h2>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {SUGGESTED_KEYWORDS.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setHackerNewsSearchTerm(keyword)}
                      className="px-3 py-1.5 bg-surface text-primary text-sm border-2 border-primary hover:bg-surface-light transition-colors font-body"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                <HackerNewsSearch onLaunchContent={handleLaunchContent} initialSearchTerm={hackerNewsSearchTerm} />
              </div>

              {/* Lemmy Section */}
              <div className="vintage-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://i.ibb.co/zHC8W0n8/icons8-cloud-64.png"
                    alt="Lemmy"
                    className="w-6 h-6 object-contain"
                  />
                  <h2 className="text-xl font-serif font-bold text-primary">Lemmy</h2>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {SUGGESTED_KEYWORDS.map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setLemmySearchTerm(keyword)}
                      className="px-3 py-1.5 bg-surface text-primary text-sm border-2 border-primary hover:bg-surface-light transition-colors font-body"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
                <LemmySearch onLaunchContent={handleLaunchContent} initialSearchTerm={lemmySearchTerm} />
              </div>
            </div>

            {/* Live Feed Section */}
            <div className="h-full">
              <div className="vintage-border p-8 lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
                <KeywordFeed onLaunchContent={handleLaunchContent} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};