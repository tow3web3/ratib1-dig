import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '../../lib/supabaseClient';
import { ThumbsUp, ArrowLeft } from 'lucide-react';

interface LiveFeedSuggestion {
  id: string;
  keyword: string;
  user_id: string;
  username: string;
  votes: number;
  hasVoted: boolean;
}

export const LiveFeedForum: React.FC = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [suggestions, setSuggestions] = useState<LiveFeedSuggestion[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchSuggestions();

    const channel = supabase
      .channel('live_feed_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'live_feed_suggestions'
      }, () => {
        fetchSuggestions();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_feed_votes'
      }, () => {
        fetchSuggestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      checkUserSubmission(user.id);
    }
  };

  const checkUserSubmission = async (userId: string) => {
    const { data } = await supabase
      .from('live_feed_suggestions')
      .select()
      .eq('user_id', userId)
      .single();
    
    setHasSubmitted(!!data);
  };

  const fetchSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // First, get all suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('live_feed_suggestions')
        .select(`
          id,
          keyword,
          user_id,
          created_at
        `);

      if (suggestionsError) throw suggestionsError;

      // Then, get vote counts for each suggestion
      const { data: votesData, error: votesError } = await supabase
        .from('live_feed_votes')
        .select('suggestion_id, user_id');

      if (votesError) throw votesError;

      // Format the data
      const formattedData = suggestionsData.map(suggestion => {
        const suggestionVotes = votesData.filter(vote => vote.suggestion_id === suggestion.id);
        return {
          ...suggestion,
          votes: suggestionVotes.length,
          hasVoted: suggestionVotes.some(vote => vote.user_id === user?.id),
          username: suggestion.user_id === user?.id ? 'You' : `User ${suggestion.user_id.slice(0, 4)}`
        };
      });

      // Sort by votes (descending)
      formattedData.sort((a, b) => b.votes - a.votes);

      setSuggestions(formattedData);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitKeyword = async () => {
    if (!newKeyword.trim() || !currentUser) return;
    
    try {
      // Add optimistic update
      const optimisticSuggestion = {
        id: crypto.randomUUID(),
        keyword: newKeyword.trim(),
        user_id: currentUser.id,
        username: 'You',
        votes: 0,
        hasVoted: false
      };

      setSuggestions(prev => [...prev, optimisticSuggestion]);
      setNewKeyword('');
      setHasSubmitted(true);

      const { error } = await supabase
        .from('live_feed_suggestions')
        .insert({
          keyword: newKeyword.trim(),
          user_id: currentUser.id
        });

      if (error) {
        // Revert optimistic update on error
        setSuggestions(prev => prev.filter(s => s.id !== optimisticSuggestion.id));
        setHasSubmitted(false);
        throw error;
      }
    } catch (err) {
      setError('You can only submit one keyword');
      setNewKeyword(optimisticSuggestion.keyword);
    }
  };

  const handleVote = async (suggestionId: string, hasVoted: boolean) => {
    if (!currentUser) return;

    // Optimistic update
    setSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === suggestionId
          ? {
              ...suggestion,
              votes: hasVoted ? suggestion.votes - 1 : suggestion.votes + 1,
              hasVoted: !hasVoted
            }
          : suggestion
      ).sort((a, b) => b.votes - a.votes)
    );

    try {
      if (hasVoted) {
        await supabase
          .from('live_feed_votes')
          .delete()
          .eq('suggestion_id', suggestionId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('live_feed_votes')
          .insert({
            suggestion_id: suggestionId,
            user_id: currentUser.id
          });
      }
    } catch (err) {
      // Revert optimistic update on error
      setSuggestions(prev =>
        prev.map(suggestion =>
          suggestion.id === suggestionId
            ? {
                ...suggestion,
                votes: hasVoted ? suggestion.votes + 1 : suggestion.votes - 1,
                hasVoted: hasVoted
              }
            : suggestion
        ).sort((a, b) => b.votes - a.votes)
      );
      console.error('Error voting:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/forum/home')}
          className="button-secondary mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Forums
        </button>

        <div className="vintage-border p-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Live Feed Suggestions</h1>
          <p className="text-primary/60 mb-8">
            Submit and vote for keywords to be added to the live feed. Each user can submit one keyword.
          </p>

          {!hasSubmitted && (
            <div className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter a keyword for the live feed..."
                  className="input flex-1"
                />
                <button
                  onClick={submitKeyword}
                  disabled={!newKeyword.trim()}
                  className="button-primary px-6"
                >
                  Submit
                </button>
              </div>
              {error && (
                <p className="text-red-500 mt-2">{error}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="loading-pulse w-10 h-10 rounded-full mx-auto mb-4" />
                <p className="text-primary/60">Loading suggestions...</p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="vintage-paper p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-lg font-serif font-bold">{suggestion.keyword}</p>
                    <p className="text-sm text-primary/60">
                      Suggested by {suggestion.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVote(suggestion.id, suggestion.hasVoted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                      suggestion.hasVoted
                        ? 'bg-accent text-white'
                        : 'bg-surface hover:bg-surface-light'
                    }`}
                  >
                    <ThumbsUp size={16} />
                    <span>{suggestion.votes}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};