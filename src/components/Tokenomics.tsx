import React from 'react';

export const Tokenomics: React.FC = () => {
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
              <h1 className="newspaper-title text-4xl md:text-6xl mb-4">TOKENOMICS GAZETTE</h1>
              <div className="vintage-divider my-4"></div>
              <p className="text-text-light italic font-body">
                "A Financial Edition of THE SCOOP FINDER" - {currentDate}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="vintage-border p-8 space-y-8">
            {/* Lead Article */}
            <article className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://i.ibb.co/DDSjRxyN/icons8-token-64.png"
                  alt="Tokenomics"
                  className="w-8 h-8 object-contain"
                />
                <h2 className="text-2xl font-serif font-bold">Token Distribution Analysis</h2>
              </div>
              <div className="vintage-divider mb-6"></div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="article-content">
                  <p className="font-body leading-relaxed">
                    Our innovative token distribution model ensures fair allocation and long-term sustainability through strategic vesting periods and community rewards. Initial lock of 5% is distributed strategically to support both early holders and platform development.
                  </p>
                </div>
                <div className="vintage-paper p-6">
                  <h3 className="text-xl font-serif font-bold mb-4">Distribution Overview</h3>
                  <ul className="space-y-3 font-body">
                    <li>Initial Lock: 5%</li>
                    <li>2% Early Holder Rewards</li>
                    <li>1.5% Platform Development</li>
                    <li>1.5% Future Initiatives</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Contract Information */}
            <article className="vintage-paper p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://i.ibb.co/DDSjRxyN/icons8-token-64.png"
                  alt="Contract"
                  className="w-5 h-5 object-contain"
                />
                <h3 className="text-xl font-serif font-bold">Contract Information</h3>
              </div>
              <div className="vintage-divider mb-4"></div>
              <div className="space-y-3 font-body">
                <p className="font-mono text-sm break-all">CksBYCEHepKAqfzY1DZdJ95ztyuYwGjP7F5DPVn7pump</p>
              </div>
            </article>

            {/* Distribution Timeline */}
            <div className="vintage-paper p-8 text-center">
              <h3 className="text-xl font-serif font-bold mb-6">Token Distribution Timeline</h3>
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-0 right-0 top-1/2 h-1 bg-primary"></div>
                
                {/* Timeline Points */}
                <div className="relative grid grid-cols-3 gap-8">
                  {/* Launch */}
                  <div className="text-center">
                    <div className="w-4 h-4 bg-accent rounded-full mx-auto mb-4 relative">
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="font-serif font-bold">Launch</span>
                      </div>
                    </div>
                    <div className="vintage-paper p-3">
                      <p className="text-sm font-bold">Initial Lock</p>
                      <p className="text-xs text-primary/60">3% locked for 1 month</p>
                      <p className="text-xs text-primary/60">2% locked for 3 months</p>
                    </div>
                  </div>
                  
                  {/* Month 1 */}
                  <div className="text-center">
                    <div className="w-4 h-4 bg-accent rounded-full mx-auto mb-4 relative">
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="font-serif font-bold">Month 1</span>
                      </div>
                    </div>
                    <div className="vintage-paper p-3">
                      <p className="text-sm font-bold">First Unlock</p>
                      <p className="text-xs text-primary/60">1.5% to first 1500 holders</p>
                      <p className="text-xs text-primary/60">1.5% to platform development</p>
                    </div>
                  </div>
                  
                  {/* Month 3 */}
                  <div className="text-center">
                    <div className="w-4 h-4 bg-accent rounded-full mx-auto mb-4 relative">
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="font-serif font-bold">Month 3</span>
                      </div>
                    </div>
                    <div className="vintage-paper p-3">
                      <p className="text-sm font-bold">Final Unlock</p>
                      <p className="text-xs text-primary/60">0.5% airdrop to first 5000 holders</p>
                      <p className="text-xs text-primary/60">1.5% for future initiatives</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Articles */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Developer Wallet Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.ibb.co/whhCGvWL/icons8-advice-60.png"
                    alt="Developer Wallet"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Developer Allocation Strategy</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>Strategic vesting schedule:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>3% locked for 1 month</li>
                    <li>2% locked for 3 months</li>
                    <li>Transparent lock mechanism</li>
                    <li>Verifiable on-chain</li>
                  </ul>
                </div>
              </article>

              {/* Early Holders Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.ibb.co/CK66h0cf/icons8-gift-64.png"
                    alt="Early Holders"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Early Holder Benefits</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>Rewarding our earliest supporters:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>1.5% distributed to first 1500 holders</li>
                    <li>0.5% airdrop to first 5000 holders</li>
                    <li>Automatic distribution system</li>
                    <li>Fair allocation model</li>
                  </ul>
                </div>
              </article>

              {/* Platform Development Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.ibb.co/LdNgZKJb/icons8-settings-100.png"
                    alt="Platform Development"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Platform Enhancement Fund</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>1.5% allocated for platform improvements:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Website enhancements</li>
                    <li>Marketing campaigns</li>
                    <li>Community events</li>
                    <li>Feature development</li>
                  </ul>
                </div>
              </article>

              {/* Future Development Article */}
              <article className="vintage-paper p-6">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.ibb.co/jkrGppp1/icons8-moon-96.png"
                    alt="Future Development"
                    className="w-5 h-5 object-contain"
                  />
                  <h3 className="text-xl font-serif font-bold">Future Growth Initiatives</h3>
                </div>
                <div className="vintage-divider mb-4"></div>
                <div className="space-y-3 font-body">
                  <p>1.5% reserved for future development:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Personal account features</li>
                    <li>Multi-wallet integration</li>
                    <li>Advanced token detection</li>
                    <li>DEX platform integration</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};