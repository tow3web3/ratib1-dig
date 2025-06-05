import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '../../lib/supabaseClient';
import { Plus, MessageSquare, Lightbulb } from 'lucide-react';
import { ForumLogin } from './ForumLogin';

interface Forum {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  username: string;
  post_count: number;
  is_pinned: boolean;
  is_dev_forum: boolean;
}

export const ForumHome: React.FC = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newForumTitle, setNewForumTitle] = useState('');
  const [newForumDescription, setNewForumDescription] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchForums();
    
    const channel = supabase
      .channel('forum_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'forums' 
      }, () => {
        fetchForums();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (!user) {
      setShowLoginModal(true);
    }
  };

  const fetchForums = async () => {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select(`
          *,
          posts (count)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForums(data || []);
    } catch (err) {
      console.error('Error fetching forums:', err);
    } finally {
      setLoading(false);
    }
  };

  const createForum = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('forums')
        .insert({
          title: newForumTitle,
          description: newForumDescription,
          user_id: user.id
        });

      if (error) throw error;
      setShowCreateModal(false);
      setNewForumTitle('');
      setNewForumDescription('');
    } catch (err) {
      console.error('Error creating forum:', err);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  if (!isAuthenticated) {
    return <ForumLogin onSuccess={handleLoginSuccess} onClose={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Community Forums</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/forum/live-feed')}
              className="button-primary"
            >
              Live Feed Suggestions
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="button-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Forum
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="loading-pulse w-10 h-10 rounded-full mx-auto mb-4" />
            <p className="text-primary/60">Loading forums...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forums.map((forum) => (
              <div
                key={forum.id}
                className={`vintage-paper p-6 hover:bg-surface-light/50 transition-colors cursor-pointer ${
                  forum.is_dev_forum ? 'bg-accent/5 border-2 border-accent' : ''
                }`}
                onClick={() => navigate(`/forum/${forum.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-serif font-bold">{forum.title}</h2>
                      {forum.is_pinned && (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-primary/60 mb-4">{forum.description}</p>
                    <div className="flex items-center gap-4 text-sm text-primary/60">
                      <span>Created by {forum.username}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={16} />
                        {forum.post_count} posts
                      </span>
                    </div>
                  </div>
                  {forum.is_dev_forum && (
                    <div className="flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-accent" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface p-8 rounded-lg max-w-lg w-full mx-4">
              <h2 className="text-2xl font-serif font-bold mb-6">Create New Forum</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-serif font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newForumTitle}
                    onChange={(e) => setNewForumTitle(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-serif font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={newForumDescription}
                    onChange={(e) => setNewForumDescription(e.target.value)}
                    className="input h-32 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createForum}
                    className="button-primary"
                  >
                    Create Forum
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showLoginModal && (
          <ForumLogin onSuccess={handleLoginSuccess} onClose={() => navigate('/')} />
        )}
      </div>
    </div>
  );
};