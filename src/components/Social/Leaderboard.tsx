import React from 'react';

export const Leaderboard: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="vintage-border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="https://i.imgur.com/3vNXJ4x.png"
              alt="Leaderboard"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-3xl font-serif font-bold">Launcherboard</h1>
          </div>
          
          <p className="text-lg font-body mb-6">
            Welcome to the Launcherboard - your window into the most exciting token launches on our platform. Track trending tokens, discover successful creators, and stay updated with the latest launches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="vintage-paper p-4 text-center">
              <img 
                src="https://i.imgur.com/4w2jTUY.png"
                alt="Trends"
                className="w-6 h-6 mx-auto mb-2"
              />
              <h3 className="font-serif font-bold mb-1">Track Trends</h3>
              <p className="text-sm text-primary/60">Monitor the most successful and trending token launches</p>
            </div>
            <div className="vintage-paper p-4 text-center">
              <img 
                src="https://i.imgur.com/w8SDJqx.png"
                alt="Community"
                className="w-6 h-6 mx-auto mb-2"
              />
              <h3 className="font-serif font-bold mb-1">Community Insights</h3>
              <p className="text-sm text-primary/60">See which tokens are gaining traction with holders</p>
            </div>
            <div className="vintage-paper p-4 text-center">
              <img 
                src="https://i.imgur.com/mEtkV30.png"
                alt="Popular"
                className="w-6 h-6 mx-auto mb-2"
              />
              <h3 className="font-serif font-bold mb-1">Popular Launches</h3>
              <p className="text-sm text-primary/60">Discover the most liked and discussed tokens</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="vintage-border p-8">
          <div className="text-center space-y-6">
            <img 
              src="https://i.imgur.com/3vNXJ4x.png"
              alt="Coming Soon"
              className="w-16 h-16 mx-auto opacity-50"
            />
            <h2 className="text-2xl font-serif font-bold">Coming Soon!</h2>
            <p className="text-lg text-primary/60 max-w-xl mx-auto">
              We're working hard to bring you the most comprehensive token launch leaderboard. Stay tuned for updates!
            </p>
            <div className="vintage-divider"></div>
            <p className="text-sm text-primary/40 italic">
              Expected launch date: May 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};