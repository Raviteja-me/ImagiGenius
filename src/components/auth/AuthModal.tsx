"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2, Palette, ImageIcon, SquarePlus, UserPlus } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import AuthLoading from './AuthLoading';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
      toast({
        title: "Welcome to ImagiGenius!",
        description: "You can now use all AI features to edit your images.",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const features = [
    { icon: Wand2, title: "General Editing", description: "Edit images with natural language" },
    { icon: ImageIcon, title: "Background Changes", description: "Transform image backgrounds" },
    { icon: Palette, title: "Style Transfer", description: "Apply artistic styles to images" },
    { icon: SquarePlus, title: "Object Manipulation", description: "Add or remove objects" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Welcome to ImagiGenius!</DialogTitle>
          <DialogDescription>
            Sign in to start creating and editing your images with AI.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AuthLoading />
        </div>
        <DialogFooter className="flex flex-col sm:flex-col sm:space-x-0 space-y-2">
          <Button onClick={handleSignIn} variant="outline" className="w-full">
            <FcGoogle className="mr-2 h-5 w-5" /> Sign in with Google
          </Button>
          <Button variant="secondary" className="w-full">
            <UserPlus className="mr-2 h-5 w-5" /> Sign up with Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 