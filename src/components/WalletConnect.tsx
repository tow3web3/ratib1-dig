import React, { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';

interface PhantomWindow extends Window {
  solana?: {
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
    isPhantom?: boolean;
    isConnected?: boolean;
    publicKey: { toString(): string } | null;
    on(event: string, callback: () => void): void;
    removeListener(event: string, callback: () => void): void;
  };
}

declare const window: PhantomWindow;

export const WalletConnect: React.FC<{ onConnectionChange?: (connected: boolean) => void }> = ({ onConnectionChange }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  useEffect(() => {
    const checkPhantom = () => {
      const isPhantom = window.solana?.isPhantom;
      setIsPhantomInstalled(!!isPhantom);

      if (window.solana?.isConnected && window.solana?.publicKey) {
        const address = window.solana.publicKey.toString();
        setWalletAddress(address);
        onConnectionChange?.(true);
      }
    };

    const initializeWallet = () => {
      if (document.readyState === 'complete') {
        checkPhantom();
      } else {
        window.addEventListener('load', checkPhantom);
        return () => window.removeEventListener('load', checkPhantom);
      }
    };

    initializeWallet();

    const handleConnect = () => {
      if (window.solana?.publicKey) {
        const address = window.solana.publicKey.toString();
        setWalletAddress(address);
        onConnectionChange?.(true);
      }
    };

    const handleDisconnect = () => {
      setWalletAddress('');
      onConnectionChange?.(false);
    };

    if (window.solana) {
      window.solana.on('connect', handleConnect);
      window.solana.on('disconnect', handleDisconnect);

      return () => {
        window.solana?.removeListener('connect', handleConnect);
        window.solana?.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [onConnectionChange]);

  const connectWallet = async () => {
    try {
      if (!window.solana) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      onConnectionChange?.(true);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setWalletAddress('');
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {walletAddress ? (
        <button
          onClick={disconnectWallet}
          className="cyber-button px-4 py-2 flex items-center gap-2 font-mono"
        >
          <Wallet size={16} />
          {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
        </button>
      ) : (
        <button
          onClick={connectWallet}
          className="cyber-button px-4 py-2 flex items-center gap-2 font-mono"
        >
          <img 
            src="https://i.imgur.com/U6PdCLf.png"
            alt="Phantom"
            className="w-4 h-4 object-contain"
          />
          {isPhantomInstalled ? 'Connect Wallet' : 'Install Phantom'}
        </button>
      )}
    </div>
  );
};