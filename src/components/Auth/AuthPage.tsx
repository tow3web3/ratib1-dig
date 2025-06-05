import React from 'react';
import { AuthModal } from './AuthModal';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AuthModal 
        onSuccess={() => navigate('/app')}
        onClose={() => navigate('/')}
      />
    </div>
  );
};