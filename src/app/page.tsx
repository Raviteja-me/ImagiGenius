import FileUploadButton from '@/components/landing/FileUploadButton';
import CursorFollower from '@/components/landing/CursorFollower';
import Logo from '@/components/common/Logo';
import { Sparkles, Wand2, Palette } from 'lucide-react';

export default function HomePage() {
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

        <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-center md:justify-start">
          <Logo className="text-foreground" textSize="text-2xl sm:text-3xl" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 animate-pulse-glow">
            <Wand2 size={60} className="mx-auto text-primary drop-shadow-lg sm:w-20 sm:h-20" />
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            Welcome to <span className="text-primary">Imagi</span><span className="text-accent">Genius</span>
          </h1>
          
          <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground sm:text-xl md:text-2xl text-balance px-4">
            The <span className="font-semibold text-primary">world's best AI image editor</span>.
            Unleash your creativity with the power of Gemini. Transform your photos with simple chat commands.
          </p>

          <div className="mt-8 sm:mt-12 flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-md">
            <FileUploadButton />
          </div>
          
          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl w-full px-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/20">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm sm:text-base">AI-Powered</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Advanced AI editing with Gemini</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/20">
              <Wand2 className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm sm:text-base">Simple Chat</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Edit with natural language</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/20">
              <Palette className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold text-sm sm:text-base">Multiple Tools</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">Background, style, object editing</p>
            </div>
          </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Gemini AI • Built with Next.js
          </p>
        </footer>
      </div>
    </>
  );
}
