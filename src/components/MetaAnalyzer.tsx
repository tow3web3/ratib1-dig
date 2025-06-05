import React, { useState, useEffect, useRef } from 'react';
import { X, BarChart2, Loader, RefreshCw, Star, Users, ThumbsUp, Wand2, GripHorizontal } from 'lucide-react';
import OpenAI from 'openai';

interface TokenData {
  name: string;
  symbol: string;
  imageUrl: string;
  contractAddress: string;
  timestamp: number;
  type: 'creation' | 'migration';
  price?: number;
  volume?: number;
  holders?: number;
  marketCapSol?: number;
  metadata?: {
    name: string;
    symbol: string;
    description?: string;
    image: string;
  };
}

const DEFAULT_TOKEN_IMAGE = 'https://i.imgur.com/placeholder.png';
const WS_URLS = [
  import.meta.env.VITE_WS_URL,
  'wss://pumpportal.fun/api/data',
  'wss://backup.pumpportal.fun/api/data'
].filter(Boolean);

const SOL_TO_EUR_RATE = 107.25;

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const extractImageUrl = (data: any): string => {
  const paths = [
    data?.metadata?.image,
    data?.metadata?.imageUrl,
    data?.image,
    data?.imageUrl,
    data?.metadata?.image_url,
    data?.image_url,
    data?.metadata?.logo,
    data?.logo
  ];

  const imageUrl = paths.find(url => url && typeof url === 'string');
  
  if (!imageUrl) return DEFAULT_TOKEN_IMAGE;

  if (imageUrl.startsWith('ipfs://')) {
    const hash = imageUrl.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  return imageUrl;
};

const formatMarketCap = (marketCap: number) => {
  const marketCapEur = marketCap * SOL_TO_EUR_RATE;
  
  if (marketCapEur >= 1000000) {
    return `€${(marketCapEur / 1000000).toFixed(2)}M`;
  } else if (marketCapEur >= 1000) {
    return `€${(marketCapEur / 1000).toFixed(2)}K`;
  }
  return `€${marketCapEur.toFixed(2)}`;
};

const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds

const MetaAnalyzer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<'creation' | 'migration'>('creation');
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [metaAnalysis, setMetaAnalysis] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const analyzeTokens = async () => {
    if (tokens.length === 0) {
      setError('No tokens available for analysis');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setMetaAnalysis(null);

    try {
      const recentTokens = tokens.slice(0, 5);
      const tokenInfo = recentTokens.map(token => ({
        name: token.name,
        symbol: token.symbol,
        description: token.metadata?.description,
        holders: token.holders,
        price: token.price,
        volume: token.volume,
        marketCap: token.marketCapSol
      }));

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a crypto market analyst specializing in identifying trends in new token launches. Analyze the provided token data and identify patterns, themes, and potential market trends. Be concise and focus on actionable insights."
          },
          {
            role: "user",
            content: `Analyze these recent token launches and identify the current meta trend:\n${JSON.stringify(tokenInfo, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const analysis = completion.choices[0].message.content;
      setMetaAnalysis(analysis);
    } catch (err) {
      console.error('Error analyzing tokens:', err);
      setError('Failed to analyze tokens. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const ws = new WebSocket(WS_URLS[0]);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected!");
      setLoading(false);
      setError(null);
      reconnectAttempts.current = 0;

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          method: mode === 'creation' ? 'subscribeNewToken' : 'subscribeMigration' 
        }));
      }
    };

    ws.onmessage = async (event) => {
      try {
        if (!event.data) {
          console.warn("Empty WebSocket message received");
          return;
        }

        const data = JSON.parse(event.data);
        console.log("WebSocket message:", data);

        if (!data || typeof data !== 'object') {
          console.warn("Invalid message format");
          return;
        }

        let metadata;
        if (data.uri) {
          try {
            const metadataUrl = data.uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            const response = await fetch(metadataUrl);
            metadata = await response.json();
          } catch (err) {
            console.warn("Failed to fetch metadata:", err);
          }
        }

        const newToken: TokenData = {
          name: data.name || data.metadata?.name || metadata?.name || 'Unknown Token',
          symbol: data.symbol || data.metadata?.symbol || metadata?.symbol || 'UNKNOWN',
          imageUrl: extractImageUrl({ ...data, metadata }),
          contractAddress: data.contractAddress || data.address || crypto.randomUUID(),
          timestamp: Date.now(),
          type: mode,
          price: data.price || data.metadata?.price,
          volume: data.volume || data.metadata?.volume,
          holders: data.holders || data.metadata?.holders,
          marketCapSol: data.marketCapSol || data.metadata?.marketCapSol,
          metadata: metadata || data.metadata
        };

        setTokens(prev => {
          // Filter out old tokens if in migration mode
          if (mode === 'migration') {
            const now = Date.now();
            return [newToken, ...prev.filter(token => 
              now - token.timestamp <= TEN_MINUTES
            )].slice(0, 50);
          }
          return [newToken, ...prev].slice(0, 50);
        });
      } catch (err) {
        console.error("Failed to process WebSocket message:", err);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      setError("Connection error. Please check your network connection.");
    };

    ws.onclose = () => {
      console.warn("WebSocket closed");
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        
        setError(`Connection lost. Reconnecting in ${Math.round(delay/1000)}s (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          const newWs = new WebSocket(WS_URLS[0]);
          wsRef.current = newWs;
        }, delay);
      } else {
        setError("Connection failed after multiple attempts. Please try again later.");
        setLoading(false);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [mode]);

  useEffect(() => {
    if (mode === 'migration') {
      const cleanup = setInterval(() => {
        setTokens(prev => {
          const now = Date.now();
          return prev.filter(token => now - token.timestamp <= TEN_MINUTES);
        });
      }, 30000); // Check every 30 seconds

      return () => clearInterval(cleanup);
    }
  }, [mode]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price * SOL_TO_EUR_RATE);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== DEFAULT_TOKEN_IMAGE) {
      img.src = DEFAULT_TOKEN_IMAGE;
    }
  };

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
          <BarChart2 className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-serif font-bold">Meta PF Analyzer</h2>
          <GripHorizontal size={16} className="text-primary/40" />
        </div>
        <button
          onClick={onClose}
          className="text-primary hover:text-accent transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('creation')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                mode === 'creation'
                  ? 'bg-accent text-white'
                  : 'bg-surface-light hover:bg-surface-light/50'
              }`}
            >
              New Tokens
            </button>
            <button
              onClick={() => setMode('migration')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                mode === 'migration'
                  ? 'bg-accent text-white'
                  : 'bg-surface-light hover:bg-surface-light/50'
              }`}
            >
              Recent Migrations
              {mode === 'migration' && (
                <span className="ml-1 text-xs opacity-80">(10m)</span>
              )}
            </button>
          </div>
          <button
            onClick={analyzeTokens}
            disabled={analyzing || tokens.length === 0}
            className="button-primary text-sm px-3 py-1.5 flex items-center gap-1"
          >
            <Wand2 size={14} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Analyzing...' : 'Analyze Meta'}
          </button>
        </div>

        {metaAnalysis && (
          <div className="mb-4 p-3 bg-accent/5 border border-accent rounded-lg">
            <h3 className="font-serif font-bold mb-1 flex items-center gap-2 text-sm">
              <Wand2 size={14} className="text-accent" />
              Meta Analysis
            </h3>
            <p className="text-primary/80 text-sm">{metaAnalysis}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
            <p className="text-sm text-primary/60">Connecting to PumpFun...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={() => {
                reconnectAttempts.current = 0;
                setLoading(true);
                const newWs = new WebSocket(WS_URLS[0]);
                wsRef.current = newWs;
              }}
              className="button-primary text-sm px-3 py-1.5 flex items-center gap-1 mx-auto"
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.contractAddress}
                  className="p-3 rounded-lg bg-surface-light/30 hover:bg-surface-light/50 border border-border/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={token.imageUrl}
                      alt={token.name}
                      onError={handleImageError}
                      className="w-10 h-10 rounded-lg object-cover bg-surface-light"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm truncate">{token.name}</h4>
                      <p className="text-accent font-mono text-xs">${token.symbol}</p>
                      {token.metadata?.description && (
                        <p className="text-xs text-primary/60 mt-0.5 line-clamp-1">
                          {token.metadata.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-primary/60">
                        {formatTimestamp(token.timestamp)}
                      </p>
                      {token.marketCapSol && (
                        <p className="text-xs font-mono text-accent">
                          {formatMarketCap(token.marketCapSol)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {token.price && (
                      <div className="text-center">
                        <span className="flex items-center justify-center gap-1 text-primary/60 text-xs">
                          <Star size={12} />
                          {formatPrice(token.price)}
                        </span>
                      </div>
                    )}
                    {token.holders && (
                      <div className="text-center">
                        <span className="flex items-center justify-center gap-1 text-primary/60 text-xs">
                          <Users size={12} />
                          {token.holders}
                        </span>
                      </div>
                    )}
                    {token.volume && (
                      <div className="text-center">
                        <span className="flex items-center justify-center gap-1 text-primary/60 text-xs">
                          <ThumbsUp size={12} />
                          {formatPrice(token.volume)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {tokens.length === 0 && (
                <div className="text-center py-6 text-primary/60 text-sm">
                  Waiting for new {mode === 'creation' ? 'tokens' : 'migrations'}...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaAnalyzer;

export { MetaAnalyzer }