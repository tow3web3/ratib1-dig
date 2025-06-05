import React from 'react';

export const LaunchGuide: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Masthead */}
          <div className="text-center mb-8">
            <div className="vintage-border p-8">
              <h1 className="newspaper-title text-4xl md:text-6xl mb-4">THE LAUNCH GUIDE</h1>
              <div className="vintage-divider my-4"></div>
              <p className="text-text-light italic font-body">
                "A Special Edition of THE SCOOP FINDER" - {currentDate}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="vintage-border p-8 space-y-8">
            {/* Lead Article */}
            <article className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://i.ibb.co/FbMxhfw3/icons8-ereader-48.png"
                  alt="Launch Guide"
                  className="w-8 h-8 object-contain"
                />
                <h2 className="text-2xl font-serif font-bold">Essential Guide to Token Launches</h2>
              </div>
              <div className="vintage-divider mb-6"></div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="article-content">
                  <p className="font-body leading-relaxed">
                    In the fast-paced world of digital assets, successful token launches require a delicate balance of timing, community engagement, and market awareness. Our comprehensive guide brings you expert insights and proven strategies for launching tokens that capture attention and build lasting communities.
                  </p>
                </div>
                <div className="vintage-paper p-6">
                  <h3 className="text-xl font-serif font-bold mb-4">Quick Tips</h3>
                  <ul className="space-y-3 font-body">
                    <li>Time launches during peak market hours</li>
                    <li>Build community before launch</li>
                    <li>Create shareable content</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Feature Articles */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Virality Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.imgur.com/fgBwwJi.png"
                    alt="Virality"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">The Art of Virality</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>Creating viral tokens requires understanding current trends and community dynamics:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Monitor trending topics across platforms</li>
                    <li>Create memorable token names</li>
                    <li>Develop unique narratives</li>
                    <li>Use eye-catching visuals</li>
                  </ul>
                </div>
              </article>

              {/* Persistence Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.imgur.com/b80roIt.png"
                    alt="Persistence"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">The Power of Persistence</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>Success often requires dedication and persistence:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Learn from each launch</li>
                    <li>Build lasting relationships</li>
                    <li>Stay active in the community</li>
                    <li>Maintain consistent engagement</li>
                  </ul>
                </div>
              </article>

              {/* Community Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.imgur.com/yQlhMmL.png"
                    alt="Community"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Community Building</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>A strong community is essential for success:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create engaging social channels</li>
                    <li>Reward early supporters</li>
                    <li>Foster organic growth</li>
                    <li>Maintain transparent communication</li>
                  </ul>
                </div>
              </article>

              {/* Timing Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.imgur.com/31UmfSV.png"
                    alt="Perfect Timing"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Perfect Timing</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>Timing can make or break a launch:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Monitor market sentiment</li>
                    <li>Launch during active hours</li>
                    <li>Capitalize on trends</li>
                    <li>Be ready for opportunities</li>
                  </ul>
                </div>
              </article>
            </div>

            {/* Best Practices Section */}
            <article className="vintage-paper p-6 mt-8">
              <h3 className="text-xl font-serif font-bold mb-4">Launch Best Practices</h3>
              <div className="vintage-divider mb-6"></div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-serif font-bold">Communication</h4>
                  <p className="font-body text-sm">
                    Maintain clear and consistent communication with your community. Transparency builds trust and long-term success.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-serif font-bold">Distribution</h4>
                  <p className="font-body text-sm">
                    Plan token distribution carefully to ensure fairness and prevent early dumps.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-serif font-bold">Timing</h4>
                  <p className="font-body text-sm">
                    Launch during active market hours and align with trending topics or events.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-serif font-bold">Community</h4>
                  <p className="font-body text-sm">
                    Build a strong community before launch and maintain engagement afterward.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};