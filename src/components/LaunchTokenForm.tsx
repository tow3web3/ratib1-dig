import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface FormData {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  solAmount: string;
  influencer1: string;
  influencer2: string;
  useVanity: boolean;
  vanityPrefix: string;
}

interface LaunchResult {
  transactionId: string;
  pumpFunLink: string;
}

const INFLUENCERS_1 = [
  { value: 'sahil', label: 'Sahil' },
  { value: 'ansem', label: 'Ansem' },
  { value: 'pauly', label: 'Pauly' },
  { value: 'manual', label: 'Manual input' }
];

const INFLUENCERS_2 = [
  { value: '', label: 'None' },
  { value: 'tate', label: 'Tate' },
  { value: 'trippy', label: 'Trippy' },
  { value: 'manual', label: 'Manual input' }
];

export const LaunchTokenForm: React.FC = () => {
  const { publicKey } = useWallet();
  const [form, setForm] = useState<FormData>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    twitter: '',
    telegram: '',
    website: '',
    solAmount: '0.5',
    influencer1: '',
    influencer2: '',
    useVanity: false,
    vanityPrefix: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LaunchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!form.name) return 'Token name is required';
    if (!form.symbol) return 'Token symbol is required';
    if (!form.description) return 'Description is required';
    if (!form.image) return 'Image URL is required';
    if (form.useVanity && !form.vanityPrefix) return 'Vanity prefix is required';
    if (isNaN(parseFloat(form.solAmount)) || parseFloat(form.solAmount) <= 0) {
      return 'Invalid SOL amount';
    }
    return null;
  };

  const handleLaunch = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/launch-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          walletAddress: publicKey.toString()
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="vintage-border p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif font-bold">Launch a Token on Pump.fun</h1>
          <WalletMultiButton className="button-primary !bg-accent hover:!bg-accent-light" />
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold">Token Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Token Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input w-full"
                  placeholder="e.g., Pepe Coin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
                  className="input w-full"
                  placeholder="e.g., PEPE"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input w-full h-24 resize-none"
                placeholder="Describe your token..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => handleChange('image', e.target.value)}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold">Social Links</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Twitter</label>
                <input
                  type="text"
                  value={form.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  className="input w-full"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telegram</label>
                <input
                  type="text"
                  value={form.telegram}
                  onChange={(e) => handleChange('telegram', e.target.value)}
                  className="input w-full"
                  placeholder="t.me/..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="input w-full"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Launch Configuration */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold">Launch Configuration</h2>
            <div>
              <label className="block text-sm font-medium mb-1">SOL Amount for Dev Wallet</label>
              <input
                type="number"
                value={form.solAmount}
                onChange={(e) => handleChange('solAmount', e.target.value)}
                className="input w-full"
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Influencer 1</label>
                <select
                  value={form.influencer1}
                  onChange={(e) => handleChange('influencer1', e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select Influencer</option>
                  {INFLUENCERS_1.map(inf => (
                    <option key={inf.value} value={inf.value}>{inf.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Influencer 2 (Optional)</label>
                <select
                  value={form.influencer2}
                  onChange={(e) => handleChange('influencer2', e.target.value)}
                  className="input w-full"
                >
                  {INFLUENCERS_2.map(inf => (
                    <option key={inf.value} value={inf.value}>{inf.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.useVanity}
                  onChange={(e) => handleChange('useVanity', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Use vanity token address</label>
              </div>
              {form.useVanity && (
                <input
                  type="text"
                  value={form.vanityPrefix}
                  onChange={(e) => handleChange('vanityPrefix', e.target.value)}
                  className="input w-full"
                  placeholder="Enter vanity prefix (e.g., MEME)"
                  maxLength={4}
                />
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border-2 border-green-500 text-green-700 rounded-lg space-y-2">
              <p>
                <strong>Transaction ID:</strong>{' '}
                <a
                  href={`https://solscan.io/tx/${result.transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light"
                >
                  {result.transactionId}
                </a>
              </p>
              <p>
                <strong>View on Pump.fun:</strong>{' '}
                <a
                  href={result.pumpFunLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light"
                >
                  {result.pumpFunLink}
                </a>
              </p>
            </div>
          )}

          <button
            onClick={handleLaunch}
            disabled={loading || !publicKey}
            className="button-primary w-full flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Launching...
              </>
            ) : (
              <>
                🚀 {publicKey ? 'Launch Token' : 'Connect Wallet to Launch Token'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};