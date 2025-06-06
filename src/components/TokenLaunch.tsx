import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ContentToLaunch } from "../types";
import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { RefreshCw, Wand2 } from "lucide-react";
import bs58 from "bs58";
import OpenAI from "openai";

interface TokenLaunchProps {
  selectedContent?: ContentToLaunch;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`,
  {
    commitment: "confirmed",
    wsEndpoint: "wss://api.mainnet-beta.solana.com",
  }
);

const TokenLaunch: React.FC<TokenLaunchProps> = ({ selectedContent }) => {
  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    image: "",
    twitter: "",
    telegram: "",
    website: "",
    solAmount: "1",
    influencer1: "",
    influencer2: "",
    useVanity: false,
    vanityPrefix: "",
    mintPublicKey: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customImage, setCustomImage] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isEditingSymbol, setIsEditingSymbol] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [websiteLink, setWebsiteLink] = useState("");
  const [walletData, setWalletData] = useState<{
    publicKey: string;
    privateKey: string;
    apiKey: string;
  } | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletInputMode, setWalletInputMode] = useState<"generate" | "load">(
    "generate"
  );
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/")) {
        setUploadedImage(file);
        setCustomImage(URL.createObjectURL(file));
        setError("");
      } else {
        setError("Please upload an image file");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  useEffect(() => {
    if (selectedContent) {
      setWebsiteLink(selectedContent.url || "");
      setCustomImage("");
      generateTokenDetails();
    }
  }, [selectedContent]);

  const generateImage = async () => {
    if (!selectedContent) return;

    setGeneratingImage(true);
    setError("");

    try {
      const prompt = `Create a unique and creative image based on: "${selectedContent.title}". 
      The image should be varied based on the content type:
      - For memes: Create a funny and viral meme-style image with bold visuals
      - For news: Create a relevant symbolic or metaphorical illustration
      - For trends: Create a modern, stylized representation
      - For tech: Create a futuristic or technological visualization
      Important: NO text or words in the image. Focus on pure visual storytelling.
      Style: High quality, detailed, professional grade artwork with strong visual impact.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      if (response.data[0]?.url) {
        setCustomImage(response.data[0].url);
        setUploadedImage(null);
      } else {
        throw new Error("No image generated");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateTokenDetails = async () => {
    if (!selectedContent) return;

    setGeneratingAI(true);
    setError("");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: `You are a creative content expert specializing in viral content. Generate memorable names, symbols, and descriptions based on trending content. Follow these rules:
              - Names should be catchy and memorable, max 32 characters
              - Symbols should be 2-4 characters, all caps
              - Descriptions should be one short, impactful sentence
              - No hashtags or emojis in descriptions
              - Focus on the core message or theme
              - Consider the source platform (${selectedContent.type}) and author (${selectedContent.author})
              - If from social media, capture the viral essence
              - If from news, focus on the key story angle
              - ALWAYS return valid JSON with name, symbol, and description fields`,
          },
          {
            role: "user",
            content: `Generate a name, symbol, and description based on this content:
              Title: ${selectedContent.title || "N/A"}
              Description: ${selectedContent.description || "N/A"}
              Source: ${selectedContent.type || "N/A"}
              Author: ${selectedContent.author || "N/A"}
              URL: ${selectedContent.url || "N/A"}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 150,
      });

      const messageContent =
        completion.choices[0].message.content ||
        '{"name":"","symbol":"","description":""}';
      const content = JSON.parse(messageContent);

      setCustomName(content.name || "");
      setCustomSymbol(content.symbol || "");
      setCustomDescription(content.description || "");
    } catch (err) {
      console.error("Error generating token details:", err);
      setError(
        "Failed to generate token details: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setGeneratingAI(false);
    }
  };

  const checkWalletBalance = async () => {
    if (!walletData) {
      setError("No wallet available");
      return;
    }

    setCheckingBalance(true);
    setError("");

    try {
      const publicKey = new PublicKey(walletData.publicKey);
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Error checking wallet balance:", err);
      setError("Failed to fetch wallet balance");
      setWalletBalance(null);
    } finally {
      setCheckingBalance(false);
    }
  };

  const removeEmojis = (text: string): string => {
    if (!text) return "";
    return text.replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F191}-\u{1F251}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]/gu,
      ""
    );
  };

  const validateImageUrl = async (url: string) => {
    if (!url) return false;
    try {
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  };

  const fetchImageAsBlob = async (url: string): Promise<Blob> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomImage(url);
    setUploadedImage(null);

    if (url && !(await validateImageUrl(url))) {
      setError("Please enter a valid image URL");
    } else {
      setError("");
    }
  };

  const getCurrentImage = () => {
    if (uploadedImage) return customImage;
    if (customImage) return customImage;
    return selectedContent?.image || "";
  };

  const generateTokenSymbol = (title?: string) => {
    if (customSymbol) {
      const symbol = removeEmojis(
        customSymbol.toUpperCase().replace(/[^A-Z]/g, "")
      );
      return `$${symbol}`;
    }
    if (!title) return "$TOKEN";
    const words = removeEmojis(title).split(" ");
    const firstWord = words[0].replace(/[^a-zA-Z]/g, "");
    return `$${firstWord.substring(0, 4).toUpperCase()}`;
  };

  const generateTokenName = (title?: string) => {
    if (customName) return removeEmojis(customName);
    if (!title) return "Token Coin";

    const cleanTitle = removeEmojis(title);
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ];
    const words = cleanTitle
      .split(" ")
      .filter((word) => !commonWords.includes(word.toLowerCase()))
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );

    const selectedWords = words.slice(0, 2);
    return selectedWords.join(" ");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,9}$/.test(value) && parseFloat(value) >= 0) {
      setForm((prev) => ({ ...prev, solAmount: value }));
    }
  };

  const selectPredefinedAmount = (amount: string) => {
    setForm((prev) => ({ ...prev, solAmount: amount }));
  };

  const generateWallet = async () => {
    try {
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      const privateKey = bs58.encode(keypair.secretKey);

      const response = await fetch("https://pumpportal.fun/api/create-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey,
          privateKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register wallet");
      }

      const { apiKey } = await response.json();

      setWalletData({
        publicKey,
        privateKey,
        apiKey,
      });
      setShowWalletModal(false);
    } catch (err) {
      console.error("Error generating wallet:", err);
      setError("Failed to generate wallet. Please try again.");
    }
  };

  const loadWalletFromPrivateKey = async () => {
    try {
      setError("");
      if (!privateKeyInput.trim()) {
        setError("Please enter a private key");
        return;
      }

      let keypair: Keypair;
      try {
        const secretKey = bs58.decode(privateKeyInput.trim());
        keypair = Keypair.fromSecretKey(secretKey);
      } catch (e) {
        setError("Invalid private key format");
        return;
      }

      const publicKey = keypair.publicKey.toString();

      const response = await fetch("https://pumpportal.fun/api/create-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey,
          privateKey: privateKeyInput.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register wallet");
      }

      const { apiKey } = await response.json();

      setWalletData({
        publicKey,
        privateKey: privateKeyInput.trim(),
        apiKey,
      });
      setShowWalletModal(false);
      setPrivateKeyInput("");
    } catch (err) {
      console.error("Error loading wallet:", err);
      setError("Failed to load wallet. Please try again.");
    }
  };

  const handleShareOnX = () => {
    if (!customName || !customSymbol) return;

    const imageUrl = getCurrentImage();
    // Remove https:// from URLs
    const cleanImageUrl = imageUrl ? imageUrl.replace(/^https?:\/\//, "") : "";
    const cleanWebsiteLink = websiteLink
      ? websiteLink.replace(/^https?:\/\//, "")
      : "";

    const text = `🚀 Just launched $${customSymbol} (${customName}) on @pumpfun via digger.today!\n\n${
      cleanImageUrl ? `🖼️ ${cleanImageUrl}\n` : ""
    }${cleanWebsiteLink ? `🔗 ${cleanWebsiteLink}` : ""}`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const launchToken = async () => {
    if (!walletData) {
      setError("Please generate a wallet first");
      return;
    }

    if (!selectedContent) {
      setError("Please select content to launch");
      return;
    }

    const requiredBalance = parseFloat(form.solAmount);
    if (walletBalance !== null && walletBalance < requiredBalance) {
      setError(
        `Insufficient SOL balance. You need at least ${requiredBalance} SOL (${
          form.solAmount
        } SOL + 0.1 SOL for fees). Current balance: ${walletBalance.toFixed(
          4
        )} SOL`
      );
      return;
    }

    const currentImage = getCurrentImage();
    if (!currentImage && !uploadedImage) {
      setError("Please provide an image for your token");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Generate mint keypair
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey.toString();
      const mintPrivateKey = bs58.encode(mintKeypair.secretKey);

      // Determine the image URL to use for the API
      let imageUrl = "";
      if (uploadedImage) {
        // If we have an uploaded file, we need to first convert it to a data URL
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedImage);
        });
      } else {
        imageUrl = currentImage;
      }

      // Call our API endpoint
      const response = await fetch("/api/deploy-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          name: customName || generateTokenName(selectedContent.title),
          symbol: (
            customSymbol ||
            generateTokenSymbol(selectedContent.title).replace("$", "")
          ).toUpperCase(),
          description: customDescription || "",
          mintSecretKey: mintPrivateKey,
          mintPublicKey,
          walletSecretKey: walletData.privateKey,
          walletPublicKey: walletData.publicKey,
          solAmount: parseFloat(form.solAmount),
          slippage: 10,
          priorityFee: 0.0005,
          twitter: form.twitter,
          telegram: form.telegram,
          website: websiteLink,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to launch token");
      }

      const { signature, confirmed } = await response.json();

      if (confirmed) {
        setSuccess(
          `Token launched successfully! View on Solscan: https://solscan.io/tx/${signature}`
        );
        setForm((prev) => ({ ...prev, mintPublicKey }));
      } else {
        setSuccess(
          `Token launch initiated! Track on Solscan: https://solscan.io/tx/${signature}`
        );
        setForm((prev) => ({ ...prev, mintPublicKey }));
      }
    } catch (err) {
      console.error("Launch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to launch token. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!selectedContent) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-3 rounded-xl">
              <img
                src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                alt="Launch"
                className="w-6 h-6 object-contain"
              />
            </div>
            <h2 className="text-2xl font-serif font-bold text-primary">
              Launch Token
            </h2>
          </div>
        </div>
        <p className="text-primary/60 font-body italic">
          Select content from below to launch a token
        </p>
        <div className="vintage-divider my-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 p-3 rounded-xl">
            <img
              src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
              alt="Launch"
              className="w-6 h-6 object-contain"
            />
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary">
            Launch Token
          </h2>
        </div>
        {generatingAI && (
          <div className="flex items-center gap-2 text-primary/60">
            <div className="w-4 h-4 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Generating token details...</span>
          </div>
        )}
      </div>

      <div className="vintage-divider"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold">Token Image</h3>
            <button
              onClick={generateImage}
              disabled={generatingImage || !selectedContent}
              className="button-secondary flex items-center gap-2"
            >
              <Wand2
                size={16}
                className={generatingImage ? "animate-spin" : ""}
              />
              {generatingImage ? "Generating..." : "Generate AI Image"}
            </button>
          </div>
          <div
            {...getRootProps()}
            className={`aspect-square overflow-hidden vintage-border relative group cursor-pointer ${
              isDragActive ? "bg-surface-light/50" : ""
            }`}
          >
            <input {...getInputProps()} />
            {getCurrentImage() ? (
              <img
                src={getCurrentImage()}
                alt="Token Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-light/30">
                <div className="text-center p-6">
                  <img
                    src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                    alt="Add Image"
                    className="w-12 h-12 mx-auto mb-2 opacity-40"
                  />
                  <p className="text-sm text-primary/60 font-body italic mb-2">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-xs text-primary/40 font-body">
                    Supports: PNG, JPG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white font-body text-sm">
                Click or drag to change image
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-serif font-bold text-primary">
              Or enter image URL:
            </label>
            <input
              type="text"
              value={customImage}
              onChange={handleImageChange}
              placeholder="Enter image URL"
              className="input font-body"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="vintage-border p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-primary/60 font-body">Token Symbol:</p>
                {isEditingSymbol ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-primary font-serif">
                        $
                      </span>
                      <input
                        type="text"
                        value={customSymbol.replace(/^\$/, "")}
                        onChange={(e) => {
                          const value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z]/g, "");
                          setCustomSymbol(value.substring(0, 4));
                        }}
                        className="input pl-6 py-1 w-24 font-body"
                        maxLength={4}
                        placeholder="SYMB"
                      />
                    </div>
                    <button
                      onClick={() => setIsEditingSymbol(false)}
                      className="button-primary text-sm px-3 py-1"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-serif text-lg">
                      {generateTokenSymbol(selectedContent?.title)}
                    </span>
                    <button
                      onClick={() => setIsEditingSymbol(true)}
                      className="button-secondary text-sm px-2 py-1 flex items-center gap-1"
                    >
                      Edit
                      <img
                        src="https://i.imgur.com/r6ZQgeP.png"
                        alt="Edit"
                        className="w-4 h-4 object-contain"
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-primary/60 font-body">Token Name:</p>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="input py-1 w-48 font-body"
                      placeholder="Enter token name"
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="button-primary text-sm px-3 py-1"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-serif text-lg">
                      {generateTokenName(selectedContent?.title)}
                    </span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="button-secondary text-sm px-2 py-1 flex items-center gap-1"
                    >
                      Edit
                      <img
                        src="https://i.imgur.com/r6ZQgeP.png"
                        alt="Edit"
                        className="w-4 h-4 object-contain"
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-primary/60 font-body">Description:</p>
                <textarea
                  value={customDescription}
                  onChange={(e) =>
                    setCustomDescription(removeEmojis(e.target.value))
                  }
                  className="input h-24 resize-none font-body"
                  placeholder="Enter custom description"
                />
              </div>

              {selectedContent?.url && (
                <a
                  href={selectedContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-light inline-flex items-center gap-2 font-serif"
                >
                  <img
                    src="https://i.imgur.com/gFkblYh.png"
                    alt="Link"
                    className="w-3.5 h-3.5 object-contain"
                  />
                  Source Link
                </a>
              )}
            </div>
          </div>

          <div className="vintage-border p-6 space-y-6">
            <div>
              <label className="block text-sm font-serif font-bold text-primary mb-2">
                Thread URL:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  className="input font-body"
                  placeholder="Enter thread URL"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <img
                    src="https://logos-world.net/wp-content/uploads/2024/10/Globe-Icon.png"
                    alt="Globe"
                    className="w-4 h-4 object-contain opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 vintage-border bg-red-50 text-red-800 font-body">
          {error}
        </div>
      )}

      <div className="vintage-divider"></div>

      <div className="flex gap-4">
        {!walletData ? (
          <button
            onClick={() => {
              setShowWalletModal(true);
              setWalletInputMode("generate");
              generateWallet();
            }}
            disabled={loading}
            className="flex-1 button-primary flex items-center justify-center gap-2 text-lg font-serif"
          >
            Generate Wallet
            <img
              src="https://i.imgur.com/8w77ZZ6.png"
              alt="Wallet"
              className="w-5 h-5 object-contain"
            />
          </button>
        ) : (
          <>
            <button
              onClick={handleShareOnX}
              disabled={!customName || !customSymbol}
              className="button-secondary flex items-center gap-2 px-4"
              title="Share on X (Twitter)"
            >
              <img
                src="https://i.imgur.com/CDFBXt3.png"
                alt="X (Twitter)"
                className="w-5 h-5 object-contain"
              />
              Share
            </button>
          </>
        )}

        {!walletData && (
          <button
            onClick={() => {
              setShowWalletModal(true);
              setWalletInputMode("load");
            }}
            disabled={loading}
            className="flex-1 button-secondary flex items-center justify-center gap-2 text-lg font-serif"
          >
            Load Private Key
            <img
              src="https://i.imgur.com/r6ZQgeP.png"
              alt="Load"
              className="w-5 h-5 object-contain"
            />
          </button>
        )}
      </div>

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-8 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-serif font-bold mb-4">
              {walletInputMode === "generate"
                ? "Generating Wallet"
                : "Load Wallet"}
            </h3>

            {walletInputMode === "generate" ? (
              <div className="text-center">
                <div className="loading-pulse w-8 h-8 rounded-full mx-auto mb-4" />
                <p className="text-primary/60">
                  Please wait while we generate your wallet...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-serif text-primary">
                    Private Key:
                  </label>
                  <input
                    type="text"
                    value={privateKeyInput}
                    onChange={(e) => setPrivateKeyInput(e.target.value)}
                    className="input font-mono w-full"
                    placeholder="Enter your wallet's private key"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-800 font-body text-sm rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={loadWalletFromPrivateKey}
                    className="flex-1 button-primary text-sm px-3 py-2"
                  >
                    Load Wallet
                  </button>
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="flex-1 button-secondary text-sm px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {walletData && (
        <div className="mt-4 p-6 vintage-border bg-surface">
          <h3 className="text-xl font-serif font-bold mb-4">
            Your Wallet Details
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-serif text-primary">Public Key:</p>
              <div className="p-3 bg-surface-light border border-border/40 rounded font-mono text-sm break-all text-primary">
                {walletData.publicKey}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-serif text-primary">Private Key:</p>
              <div className="p-3 bg-surface-light border border-border/40 rounded font-mono text-sm break-all text-primary">
                {walletData.privateKey}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-serif text-primary">Balance:</p>
                <button
                  onClick={checkWalletBalance}
                  disabled={checkingBalance}
                  className="button-secondary text-xs px-2 py-1 flex items-center gap-1"
                >
                  <RefreshCw
                    size={12}
                    className={checkingBalance ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
              <div className="p-3 bg-surface-light border border-border/40 rounded font-mono text-sm text-primary">
                {checkingBalance ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Checking balance...
                  </span>
                ) : walletBalance !== null ? (
                  `${walletBalance.toFixed(4)} SOL`
                ) : (
                  "Failed to fetch balance"
                )}
              </div>
            </div>

            <div className="vintage-divider my-4"></div>

            <div>
              <label className="block text-sm font-serif font-bold text-primary mb-2">
                Amount (SOL):
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {["0.5", "1", "2", "5"].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => selectPredefinedAmount(amount)}
                    className={`py-2 px-3 vintage-border font-serif ${
                      form.solAmount === amount
                        ? "bg-primary text-black"
                        : "bg-surface hover:bg-surface-light"
                    }`}
                  >
                    {amount} SOL
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={form.solAmount}
                  onChange={handleAmountChange}
                  className="input pr-16 font-body"
                  placeholder="Enter custom amount in SOL"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-primary/60 font-serif">SOL</span>
                </div>
              </div>
            </div>

            <button
              onClick={launchToken}
              disabled={
                loading ||
                !selectedContent ||
                (!getCurrentImage() && !uploadedImage)
              }
              className={`w-full mt-4 button-primary flex items-center justify-center gap-2 text-lg font-serif ${
                loading ||
                !selectedContent ||
                (!getCurrentImage() && !uploadedImage)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? "Launching..." : `Launch with ${form.solAmount} SOL`}
              <img
                src="https://i.imgur.com/Kw6itOm.png"
                alt="Launch"
                className="w-5 h-5 object-contain"
              />
            </button>

            <br />
   
            {success && (
              <div className="p-4 vintage-border bg-emerald-50 text-emerald-800 font-body">
                {success}
                {form.mintPublicKey && (
                  <div className="mt-4">
                    <a
                      href={`https://pump.fun/coin/${form.mintPublicKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary inline-flex items-center gap-2 text-sm px-4 py-2 font-serif"
                    >
                      <img
                        src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                        alt="Pump.fun"
                        className="w-4 h-4 object-contain"
                      />
                      Show on Pump.fun
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenLaunch;
