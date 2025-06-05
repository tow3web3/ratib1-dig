import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16 px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Masthead */}
          <div className="text-center mb-16">
            <div className="vintage-border p-8">
              <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src="https://i.imgur.com/gClqBPj.png"
                  alt="THE DIGGER HERALD"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h1 className="newspaper-title text-6xl md:text-8xl mb-4">THE DIGGER HERALD</h1>
              <div className="vintage-divider my-4"></div>
              <p className="text-text-light italic font-body">
                "All the Token News That's Fit to Launch" - {currentDate}
              </p>
            </div>
          </div>

          {/* Lead Story */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="article-content">
              <h2 className="article-title mb-4">Transform Trending Topics into Tokens – Instantly</h2>
              <p className="mb-4">Explore the hottest topics from Reddit, Twitter, and top news sites – all in one dashboard. Our platform scans the web in real-time to surface viral content you can capitalize on. With just a few clicks, launch your own token on Solana via our seamless pump.fun integration.</p>
              <p className="mb-4">Whether it's memes, breaking news, or cultural moments, ride the trend – and own it.</p>
              <button
                onClick={() => navigate('/app')}
                className="button-primary text-lg px-8 py-4 flex items-center gap-2"
              >
                Try It Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="card p-6 vintage-border">
                <h3 className="text-xl font-serif font-bold mb-4">Discover. Create. Dominate.</h3>
                <ul className="space-y-4 font-body">
                  <li className="flex items-start gap-2">
                    <img 
                      src="https://i.ibb.co/GQwhQQ3g/icons8-global-64.png"
                      alt="Content Discovery"
                      className="w-5 h-5 object-contain mt-1"
                    />
                    <div>
                      <p className="font-bold">Content Discovery</p>
                      <p className="text-text-light">Track trending topics across social platforms and news outlets – updated in real time.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <img 
                      src="https://i.ibb.co/pvdpy108/icons8-global-64-1.png"
                      alt="Token Launch"
                      className="w-5 h-5 object-contain mt-1"
                    />
                    <div>
                      <p className="font-bold">One-Click Token Launch</p>
                      <p className="text-text-light">Found something hot? Turn it into a token immediately using our pump.fun integration.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Airdrop Announcement */}
              <div className="vintage-paper p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src="https://i.imgur.com/7JRFEGK.png"
                    alt="Airdrop"
                    className="w-6 h-6 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Massive Airdrop Alert!</h3>
                </div>
                <p className="text-sm mb-4">Join our early adopters program and get rewarded! We're distributing tokens to:</p>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• First 1500 holders: 1.5% allocation</li>
                  <li>• First 5000 holders: 0.5% bonus airdrop</li>
                  <li>• Active community members: Special rewards</li>
                </ul>
                <button 
                  onClick={() => navigate('/tokenomics')}
                  className="button-primary text-sm px-4 py-2"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Platform Integrations */}
          <div className="vintage-border p-8 mb-16">
            <h2 className="text-2xl font-serif font-bold text-center mb-8">Powered By Leading Platforms</h2>
            <div className="grid grid-cols-3 md:grid-cols-8 gap-6 items-center justify-items-center">
              <img 
                src="https://www.reddiquette.com/wp-content/uploads/2020/09/What-Is-The-Reddit-Logo-Called.png"
                alt="Reddit"
                className="h-8 object-contain"
              />
              <img 
                src="https://logos-world.net/wp-content/uploads/2024/10/Pump-Fun-Logo.png"
                alt="pump.fun"
                className="h-8 object-contain"
              />
              <img 
                src="https://s.yimg.com/rz/p/yahoo_homepage_en-US_s_f_p_bestfit_homepage.png"
                alt="Yahoo"
                className="h-8 object-contain"
              />
              <img 
                src="https://i.imgur.com/CDFBXt3.png"
                alt="X"
                className="h-8 object-contain"
              />
              <img 
                src="https://w7.pngwing.com/pngs/738/777/png-transparent-computer-icons-hacker-news-intelligent-miscellaneous-angle-text-thumbnail.png"
                alt="Hacker News"
                className="h-8 object-contain"
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png"
                alt="TikTok"
                className="h-8 object-contain"
              />
              <img 
                src="https://i.ibb.co/zHC8W0n8/icons8-cloud-64.png"
                alt="Lemmy"
                className="h-8 object-contain"
              />
              <img 
                src="https://pbs.twimg.com/profile_images/1462287879565201409/5UYqudVs_400x400.jpg"
                alt="Birdeye"
                className="h-8 w-8 object-cover rounded-full"
              />
            </div>
          </div>

          {/* Feature Preview Section */}
          <div className="vintage-border p-4 mb-16">
            <h2 className="text-xl font-serif font-bold text-center mb-4">SCOOP! Features Coming to The Herald!</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="vintage-paper p-3">
                <h3 className="text-sm font-serif font-bold">Personal Dashboard</h3>
                <p className="text-xs text-text-light italic">Track your launches and monitor performance in real-time</p>
              </div>
              <div className="vintage-paper p-3">
                <h3 className="text-sm font-serif font-bold">Multi-Wallet Hub</h3>
                <p className="text-xs text-text-light italic">Manage multiple wallets and track their performance</p>
              </div>
              <div className="vintage-paper p-3">
                <h3 className="text-sm font-serif font-bold">OG Token Alerts</h3>
                <p className="text-xs text-text-light italic">Be first to spot the next viral token trend</p>
              </div>
              <div className="vintage-paper p-3">
                <h3 className="text-sm font-serif font-bold">DEX Analytics</h3>
                <p className="text-xs text-text-light italic">Advanced charts and trading insights at your fingertips</p>
              </div>
              <div className="vintage-paper p-3">
                <h3 className="text-sm font-serif font-bold">TikTok Launch</h3>
                <p className="text-xs text-text-light italic">Create tokens directly from viral TikTok content</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center vintage-border p-8">
            <h2 className="article-title mb-4">Be First. Move Fast. Own the Trend.</h2>
            <p className="font-body text-text-light mb-8">Whether you're here to experiment, invest, or go viral – this is your launchpad.</p>
            <button
              onClick={() => navigate('/app')}
              className="button-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
            >
              👉 Try it now and start creating tokens
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};