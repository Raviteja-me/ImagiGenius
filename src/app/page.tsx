"use client";

import FileUploadButton from '@/components/landing/FileUploadButton';
import CursorFollower from '@/components/landing/CursorFollower';
import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Wand2, Palette, Briefcase, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <CursorFollower />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 text-center selection:bg-accent selection:text-accent-foreground">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-animated opacity-70 dark:opacity-50" />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.02]"
          style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ff8c00\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
        />

        {/* Header with better mobile spacing and user controls */}
        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10">
          <div className="pt-2 sm:pt-0">
            <Logo className="text-foreground" textSize="text-xl sm:text-2xl md:text-3xl" />
          </div>
          
          {/* User controls */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.displayName || user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          )}
        </header>

        {/* Main content with proper spacing from header */}
        <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto pt-16 sm:pt-20 md:pt-24">
          <div className="mb-4 sm:mb-6 md:mb-8 animate-pulse-glow">
            <Wand2 size={48} className="mx-auto text-primary drop-shadow-lg sm:w-16 sm:h-16 md:w-20 md:h-20" />
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground md:text-6xl lg:text-7xl xl:text-8xl px-2">
            Welcome to <span className="text-primary">Imagi</span><span className="text-accent">Genius</span>
          </h1>
          
          <p className="mt-3 sm:mt-4 md:mt-6 max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground md:text-xl lg:text-2xl text-balance px-4">
            The <span className="font-semibold text-primary">world's best AI image editor</span>.
            Unleash your creativity with the power of Gemini. Transform your photos with simple chat commands.
          </p>

          <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md">
            <FileUploadButton />
          </div>
          
          <div className="mt-6 sm:mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-2xl w-full px-4">
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/20">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
              <h3 className="font-semibold text-xs sm:text-sm md:text-base">AI-Powered</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Advanced AI editing with Gemini</p>
            </div>
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/20">
              <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
              <h3 className="font-semibold text-xs sm:text-sm md:text-base">Simple Chat</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Edit with natural language</p>
            </div>
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/20">
              <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
              <h3 className="font-semibold text-xs sm:text-sm md:text-base">Multiple Tools</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Background, style, object editing</p>
            </div>
          </div>

          {/* LazyJobSeeker Product Section */}
          <div className="mt-12 sm:mt-16 md:mt-20 w-full max-w-4xl px-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    LazyJobSeeker.com
                  </h2>
                  <p className="text-sm sm:text-base text-blue-100 mb-4 max-w-2xl">
                    Find your dream job with AI-powered job matching. Our intelligent platform connects you with the perfect opportunities based on your skills, experience, and preferences.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                    >
                      <Link href="https://lazyjobseeker.com" target="_blank" rel="noopener noreferrer">
                        Visit LazyJobSeeker
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer with better mobile spacing */}
        <footer className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Gemini AI • Built with Next.js
          </p>
        </footer>
      </div>
    </>
  );
}
