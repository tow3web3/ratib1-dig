import React, { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, ExternalLink } from 'lucide-react';

interface BuyModalProps {
  onClose: () => void;
}

export const BuyModal: React.FC<BuyModalProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!modalRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - (modalRef.current?.offsetWidth || 0)));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - (modalRef.current?.offsetHeight || 0)));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag as any);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDrag as any);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  return (
    <div 
      ref={modalRef}
      className="fixed bg-surface rounded-lg shadow-2xl z-50 w-[480px] transition-transform"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      <div 
        className="p-4 border-b-2 border-primary flex items-center justify-between cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-3">
          <img 
            src="https://i.imgur.com/mEtkV30.png"
            alt="Buy"
            className="w-6 h-6 object-contain"
          />
          <h2 className="text-xl font-serif font-bold">Buy $SCOOP</h2>
          <GripHorizontal size={16} className="text-primary/40" />
        </div>
        <button
          onClick={onClose}
          className="text-primary hover:text-accent transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Getting Started Section */}
        <div>
          <h3 className="text-lg font-serif font-bold mb-4">Getting Started</h3>
          <div className="vintage-paper p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white font-serif">
                1
              </div>
              <div>
                <h4 className="font-serif font-bold mb-1">Install Phantom Wallet</h4>
                <p className="text-sm font-body mb-2">First, you'll need a Phantom wallet to buy and store tokens on Solana.</p>
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
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white font-serif">
                2
              </div>
              <div>
                <h4 className="font-serif font-bold mb-1">Get SOL</h4>
                <p className="text-sm font-body mb-2">You'll need SOL in your wallet to buy tokens. You can buy SOL on exchanges like Binance or FTX and send it to your Phantom wallet.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-white font-serif">
                3
              </div>
              <div>
                <h4 className="font-serif font-bold mb-1">Connect Your Wallet</h4>
                <p className="text-sm font-body">Click the "Connect Wallet" button on pump.fun or Dexscreener and select Phantom to connect your wallet.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Options */}
        <div className="space-y-4">
          {/* pump.fun Option */}
          <div className="vintage-paper p-6">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                alt="pump.fun"
                className="w-8 h-8 object-contain"
              />
              <h4 className="text-lg font-serif font-bold">Buy on pump.fun</h4>
            </div>
            <div className="space-y-3 mb-4">
              <p className="text-sm font-body">To buy on pump.fun:</p>
              <ol className="list-decimal pl-5 text-sm font-body space-y-2">
                <li>Visit pump.fun and connect your Phantom wallet</li>
                <li>Search for "DIGGER" in the token search bar</li>
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
                className="w-8 h-8 object-contain rounded-full"
              />
              <h4 className="text-lg font-serif font-bold">Buy on Dexscreener</h4>
            </div>
            <div className="space-y-3 mb-4">
              <p className="text-sm font-body">To buy on Dexscreener:</p>
              <ol className="list-decimal pl-5 text-sm font-body space-y-2">
                <li>Visit Dexscreener and connect your Phantom wallet</li>
                <li>Search for "DIGGER" or paste the contract address</li>
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

        {/* Contract Info */}
        <div className="p-4 bg-accent/5 rounded-lg border-2 border-accent">
          <h4 className="font-serif font-bold mb-2">Contract Address</h4>
          <p className="font-mono text-sm break-all">8BtoThi2ZoXnF7QQK1Wjmh2JuBw9FjVvhnGMVZ2vpump</p>
        </div>

        {/* Safety Tips */}
        <div className="p-4 bg-surface-light rounded-lg border border-border/40">
          <h4 className="font-serif font-bold mb-2 flex items-center gap-2">
            <img 
              src="https://i.imgur.com/QPLtZm2.png"
              alt="Safety"
              className="w-5 h-5 object-contain"
            />
            Safety Tips
          </h4>
          <ul className="text-sm font-body space-y-1">
            <li>• Always verify the contract address before buying</li>
            <li>• Never share your wallet's private key or seed phrase</li>
            <li>• Set reasonable slippage to avoid front-running</li>
            <li>• Start with small amounts to test the process</li>
          </ul>
        </div>
      </div>
    </div>
  );
};