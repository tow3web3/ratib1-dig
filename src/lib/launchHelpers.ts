import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import axios from 'axios';
import FormData from 'form-data';

interface TokenLaunchParams {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  solAmount: number;
  influencer1: string;
  influencer2: string;
  mintKeypair: Keypair;
  walletAddress: string;
}

export async function generateVanityKeypair(prefix: string): Promise<Keypair> {
  prefix = prefix.toLowerCase();
  let attempts = 0;
  const maxAttempts = 10000;

  while (attempts < maxAttempts) {
    const keypair = Keypair.generate();
    const address = keypair.publicKey.toString();
    
    if (address.toLowerCase().slice(0, prefix.length) === prefix) {
      return keypair;
    }
    
    attempts++;
  }

  throw new Error(`Could not generate vanity address with prefix "${prefix}" after ${maxAttempts} attempts`);
}

export async function uploadToIPFS(imageUrl: string): Promise<string> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  const formData = new FormData();
  formData.append('file', buffer, 'image.png');

  const pinataRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      'pinata_api_key': process.env.PINATA_API_KEY,
      'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
    }
  });

  return `ipfs://${pinataRes.data.IpfsHash}`;
}

export async function createTokenOnPumpFun(params: TokenLaunchParams) {
  const {
    name, symbol, description, image,
    twitter, telegram, website,
    solAmount, influencer1, influencer2,
    mintKeypair, walletAddress
  } = params;

  // Upload image to IPFS
  const ipfsImageUrl = await uploadToIPFS(image);

  // Prepare metadata
  const metadata = {
    name,
    symbol,
    description,
    image: ipfsImageUrl,
    external_url: website,
    attributes: [
      { trait_type: 'Twitter', value: twitter },
      { trait_type: 'Telegram', value: telegram }
    ]
  };

  // Create token on Pump.fun
  const response = await axios.post('https://api.pump.fun/v1/create-token', {
    metadata,
    mintKeypair: bs58.encode(mintKeypair.secretKey),
    walletAddress,
    solAmount,
    influencer1,
    influencer2
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.PUMP_API_KEY}`
    }
  });

  return {
    transactionId: response.data.transactionId,
    pumpFunLink: `https://pump.fun/token/${mintKeypair.publicKey.toString()}`
  };
}