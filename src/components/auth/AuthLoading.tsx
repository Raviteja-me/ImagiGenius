import React from 'react';
import { Loader2 } from 'lucide-react';

const AuthLoading: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
};

export default AuthLoading; 