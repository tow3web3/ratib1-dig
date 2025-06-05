import React, { useState } from 'react';
import { Lightbulb, MessageSquare, Search } from 'lucide-react';

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

interface SearchSite {
  id: string;
  name: string;
  enabled: boolean;
}

interface KeywordSuggestionsProps {
  onKeywordSelect: (keyword: string, sites: string[]) => void;
}

export const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({ onKeywordSelect }) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchSites, setSearchSites] = useState<SearchSite[]>([
    { id: 'reddit', name: 'Reddit', enabled: true },
    { id: 'hackernews', name: 'Hacker News', enabled: true },
    { id: 'lemmy', name: 'Lemmy', enabled: true }
  ]);

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          type: 'advisor'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      if (data.response) {
        setAiResponse(data.response);
      } else {
        setAiResponse('No response received from AI. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setAiResponse('Sorry, I encountered an error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSiteToggle = (siteId: string) => {
    setSearchSites(sites => 
      sites.map(site => 
        site.id === siteId ? { ...site, enabled: !site.enabled } : site
      )
    );
  };

  const handleKeywordClick = (keyword: string) => {
    const enabledSites = searchSites
      .filter(site => site.enabled)
      .map(site => site.id);
    
    if (enabledSites.length === 0) {
      // Enable all sites if none are selected
      setSearchSites(sites => sites.map(site => ({ ...site, enabled: true })));
      onKeywordSelect(keyword, searchSites.map(site => site.id));
    } else {
      onKeywordSelect(keyword, enabledSites);
    }
  };

  return (
    <div className="card p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 p-3 rounded-xl">
            <Lightbulb className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Trending Keywords</h2>
            <p className="text-sm text-primary/60">Select sites to search and click a keyword to begin</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAIModal(true);
            handleAskAI();
          }}
          className="button-secondary flex items-center gap-2"
        >
          <MessageSquare size={16} />
          Ask AI Advisor
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {searchSites.map(site => (
          <button
            key={site.id}
            onClick={() => handleSiteToggle(site.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              site.enabled
                ? 'bg-accent text-white border-accent hover:bg-accent-light'
                : 'bg-surface-light/30 text-primary/60 border-border/40 hover:bg-surface-light/50'
            }`}
          >
            {site.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_KEYWORDS.map((keyword) => (
          <button
            key={keyword}
            onClick={() => handleKeywordClick(keyword)}
            className="button-secondary text-sm px-4 py-2 flex items-center gap-2"
          >
            <Search size={14} />
            {keyword}
          </button>
        ))}
      </div>

      {showAIModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-primary">AI Memecoin Advisor</h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-primary/60 hover:text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="min-h-[100px] mb-6">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-pulse w-8 h-8 rounded-full" />
                </div>
              ) : (
                <div className="text-primary whitespace-pre-wrap">
                  {aiResponse}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAIModal(false)}
                className="button-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};