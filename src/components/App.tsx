import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { MainApp } from './components/MainApp';
import { LaunchGuide } from './components/LaunchGuide';
import { Tokenomics } from './components/Tokenomics';
import { LaunchTokenForm } from './components/LaunchTokenForm';
import { Header } from './components/Header';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const endpoint = clusterApiUrl('mainnet-beta');
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
              <Route path="/launch" element={
                <>
                  <Header />
                  <LaunchTokenForm />
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