import React from 'react';

export const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="vintage-border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src="https://i.imgur.com/w8SDJqx.png"
              alt="Profile"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-3xl font-serif font-bold">My Profile</h1>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="vintage-border p-8">
          <div className="text-center space-y-6">
            <img 
              src="https://i.imgur.com/w8SDJqx.png"
              alt="Coming Soon"
              className="w-16 h-16 mx-auto opacity-50"
            />
            <h2 className="text-2xl font-serif font-bold">Profile Features Coming Soon!</h2>
            <p className="text-lg text-primary/60 max-w-xl mx-auto">
              We're working hard to bring you amazing social features including launch tracking, achievement badges, and community engagement tools. Stay tuned for updates!
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