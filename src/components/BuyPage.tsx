import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../constants';

export const BuyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="vintage-border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="https://i.imgur.com/mEtkV30.png"
              alt="Buy"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-3xl font-serif font-bold">Buy $SCOOP</h1>
          </div>
          <p className="text-lg font-body">
            Welcome to the official $SCOOP token purchase guide. Follow these simple steps to acquire $SCOOP tokens and join our community.
          </p>
        </div>

        {/* Getting Started Section */}
        <div className="vintage-border p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="vintage-paper p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white font-serif text-xl">
                  1
                </div>
                <h3 className="font-serif font-bold">Install Phantom</h3>
              </div>
              <p className="text-sm font-body mb-4">
                First, you'll need a Phantom wallet to buy and store tokens on Solana.
              </p>
              <a
                href="https://phantom.app"
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary text-sm px-3 py-1.5 flex items-center gap-1 w-fit"
              >
                Install Phantom
                <img 
                  src="https://i.imgur.com/U6PdCLf.png"
                  alt="Phantom"
                  className="w-4 h-4 object-contain"
                />
              </a>
            </div>

            <div className="vintage-paper p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white font-serif text-xl">
                  2
                </div>
                <h3 className="font-serif font-bold">Get SOL</h3>
              </div>
              <p className="text-sm font-body">
                You'll need SOL in your wallet to buy tokens. You can buy SOL on exchanges like Binance or FTX and send it to your Phantom wallet.
              </p>
            </div>

            <div className="vintage-paper p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white font-serif text-xl">
                  3
                </div>
                <h3 className="font-serif font-bold">Connect Wallet</h3>
              </div>
              <p className="text-sm font-body">
                Click the "Connect Wallet" button on pump.fun or Dexscreener and select Phantom to connect your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Buy Options */}
        <div className="vintage-border p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Where to Buy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* pump.fun Option */}
            <div className="vintage-paper p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                  alt="pump.fun"
                  className="w-12 h-12 object-contain"
                />
                <h3 className="text-xl font-serif font-bold">Buy on pump.fun</h3>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-sm font-body">To buy on pump.fun:</p>
                <ol className="list-decimal pl-5 text-sm font-body space-y-2">
                  <li>Visit pump.fun and connect your Phantom wallet</li>
                  <li>Search for "SCOOP" in the token search bar</li>
                  <li>Enter the amount of SOL you want to spend</li>
                  <li>Click "Buy" and confirm the transaction in your wallet</li>
                </ol>
              </div>
              <a
                href="https://pump.fun"
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary text-sm px-4 py-2 flex items-center gap-2 w-fit"
              >
                Go to pump.fun
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Dexscreener Option */}
            <div className="vintage-paper p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://pbs.twimg.com/profile_images/1462287879565201409/5UYqudVs_400x400.jpg"
                  alt="Dexscreener"
                  className="w-12 h-12 object-contain rounded-full"
                />
                <h3 className="text-xl font-serif font-bold">Buy on Dexscreener</h3>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-sm font-body">To buy on Dexscreener:</p>
                <ol className="list-decimal pl-5 text-sm font-body space-y-2">
                  <li>Visit Dexscreener and connect your Phantom wallet</li>
                  <li>Search for "SCOOP" or paste the contract address</li>
                  <li>Click on the trading pair you want to use</li>
                  <li>Select "Trade" to be redirected to the DEX</li>
                  <li>Enter the amount and complete the swap</li>
                </ol>
              </div>
              <a
                href="https://dexscreener.com"
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary text-sm px-4 py-2 flex items-center gap-2 w-fit"
              >
                Go to Dexscreener
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="vintage-border p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Contract Information</h2>
          <div className="vintage-paper p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold mb-2">Contract Address</h3>
                <p className="font-mono text-sm break-all p-4 bg-surface-light rounded border border-border/40">
                  {CONTRACT_ADDRESS}
                </p>
              </div>
              <div>
                <h3 className="font-serif font-bold mb-2">Token Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-primary/60">Name:</p>
                    <p className="font-medium">SCOOP</p>
                  </div>
                  <div>
                    <p className="text-primary/60">Symbol:</p>
                    <p className="font-medium">$SCOOP</p>
                  </div>
                  <div>
                    <p className="text-primary/60">Network:</p>
                    <p className="font-medium">Solana</p>
                  </div>
                  <div>
                    <p className="text-primary/60">Type:</p>
                    <p className="font-medium">SPL Token</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="vintage-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="https://i.imgur.com/QPLtZm2.png"
              alt="Safety"
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-2xl font-serif font-bold">Safety Tips</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="vintage-paper p-6">
              <h3 className="font-serif font-bold mb-4">Before Buying</h3>
              <ul className="text-sm font-body space-y-2">
                <li>• Always verify the contract address</li>
                <li>• Never share your wallet's private key</li>
                <li>• Check token liquidity and trading volume</li>
                <li>• Start with small test transactions</li>
              </ul>
            </div>
            <div className="vintage-paper p-6">
              <h3 className="font-serif font-bold mb-4">Trading Tips</h3>
              <ul className="text-sm font-body space-y-2">
                <li>• Set reasonable slippage limits</li>
                <li>• Monitor gas fees during peak times</li>
                <li>• Keep some SOL for transaction fees</li>
                <li>• Join our community for updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};