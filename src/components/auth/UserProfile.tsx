"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Sparkles, ImageIcon } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, userData, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "Come back soon to create more amazing images!",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user || !userData) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.displayName || 'User'}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Images Generated</span>
            </div>
            <span className="text-lg font-bold text-primary">{userData.usageNumber}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Member Since</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(userData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfile; 