import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { MainApp } from './components/MainApp';
import { LaunchGuide } from './components/LaunchGuide';
import { Tokenomics } from './components/Tokenomics';
import { BuyPage } from './components/BuyPage';
import { ForumHome } from './components/Forum/ForumHome';
import { ForumView } from './components/Forum/ForumView';
import { LiveFeedForum } from './components/Forum/LiveFeedForum';
import { Leaderboard } from './components/Social/Leaderboard';
import { Profile } from './components/Social/Profile';
import { Header } from './components/Header';
import { AuthPage } from './components/Auth/AuthPage';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useSupabaseClient } from './lib/supabaseClient';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const endpoint = clusterApiUrl('mainnet-beta');
  const wallets = [new PhantomWalletAdapter()];
  const supabase = useSupabaseClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-pulse w-10 h-10 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-800 rounded-lg max-w-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">
            Note: If you're seeing this error, you may need to disable browser extensions that could interfere with the application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/app" element={
                <>
                  <Header />
                  <MainApp />
                </>
              } />
              <Route path="/guide" element={
                <>
                  <Header />
                  <LaunchGuide />
                </>
              } />
              <Route path="/tokenomics" element={
                <>
                  <Header />
                  <Tokenomics />
                </>
              } />
              <Route path="/buy" element={
                <>
                  <Header />
                  <BuyPage />
                </>
              } />
              
              {/* Protected Routes */}
              <Route path="/forum" element={
                isAuthenticated ? (
                  <>
                    <Header />
                    <ForumHome />
                  </>
                ) : (
                  <Navigate to="/auth" replace />
                )
              } />
              <Route path="/forum/live-feed" element={
                isAuthenticated ? (
                  <>
                    <Header />
                    <LiveFeedForum />
                  </>
                ) : (
                  <Navigate to="/auth" replace />
                )
              } />
              <Route path="/forum/:forumId" element={
                isAuthenticated ? (
                  <>
                    <Header />
                    <ForumView />
                  </>
                ) : (
                  <Navigate to="/auth" replace />
                )
              } />
              <Route path="/leaderboard" element={
                <>
                  <Header />
                  <Leaderboard />
                </>
              } />
              <Route path="/profile" element={
                <>
                  <Header />
                  <Profile />
                </>
              } />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;