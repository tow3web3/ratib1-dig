import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '../../lib/supabaseClient';
import { Send, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
}

export const ForumView: React.FC = () => {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [forum, setForum] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to forum home if forumId is 'home'
  useEffect(() => {
    if (forumId === 'home') {
      navigate('/forum');
      return;
    }
  }, [forumId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (forumId === 'home') return; // Skip fetching if we're redirecting
    
    fetchForum();
    fetchPosts();
    fetchCurrentUser();
    
    const channel = supabase
      .channel('forum_posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts',
        filter: `forum_id=eq.${forumId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [...prev, payload.new as Post]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [forumId]);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const fetchForum = async () => {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select('*')
        .eq('id', forumId)
        .single();

      if (error) throw error;
      setForum(data);
    } catch (err) {
      console.error('Error fetching forum:', err);
      navigate('/forum'); // Redirect to forum list on error
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('forum_id', forumId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim() || !currentUser) return;
    
    try {
      const optimisticPost = {
        id: crypto.randomUUID(),
        content: newPost,
        created_at: new Date().toISOString(),
        user_id: currentUser.id,
        username: currentUser.user_metadata.username || 'Anonymous',
        forum_id: forumId
      };

      setPosts(prev => [...prev, optimisticPost]);
      setNewPost('');
      scrollToBottom();

      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost,
          forum_id: forumId,
          user_id: currentUser.id
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error creating post:', err);
      setPosts(prev => prev.filter(post => post.id !== optimisticPost.id));
      setNewPost(optimisticPost.content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createPost();
    }
  };

  if (forumId === 'home') return null;
  if (!forum) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/forum')}
          className="button-secondary mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Forums
        </button>

        <div className="vintage-border p-8">
          <h1 className="text-3xl font-serif font-bold mb-2">{forum.title}</h1>
          <p className="text-primary/60 mb-8">{forum.description}</p>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="loading-pulse w-10 h-10 rounded-full mx-auto mb-4" />
                <p className="text-primary/60">Loading posts...</p>
              </div>
            ) : (
              <>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      className={`vintage-paper p-4 mb-4 ${
                        post.user_id === currentUser?.id ? 'bg-accent/5' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-serif font-bold">{post.username}</span>
                        <span className="text-sm text-primary/60">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-primary">{post.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-4 mt-8">
                  <input
                    type="text"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Write a message..."
                    className="input flex-1"
                    autoFocus
                  />
                  <button
                    onClick={createPost}
                    disabled={!newPost.trim()}
                    className="button-primary px-6 flex items-center gap-2"
                  >
                    <Send size={20} />
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};