import React, { useState } from 'react';
import { useSupabaseClient } from '../../lib/supabaseClient';

interface AuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const supabase = useSupabaseClient();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      validateInput();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: `${username}@temp.com`,
          password,
        });
        if (error) throw error;
        onSuccess();
      } else {
        // First check if username is already taken
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', username)
          .limit(1);

        if (profiles && profiles.length > 0) {
          throw new Error('Username is already taken');
        }

        // Create the auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: `${username}@temp.com`,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Failed to create user');

        // The user profile will be created automatically by the database trigger
        onSuccess();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface p-8 rounded-lg max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif font-bold mb-4">
            {isLogin ? 'Sign In to Continue' : 'Create Your Account'}
          </h2>
          <div className="vintage-divider"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-serif font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              title="Username can only contain letters, numbers, and underscores"
            />
          </div>

          <div>
            <label className="block text-sm font-serif font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button-primary flex-1"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:text-accent-light font-serif"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};