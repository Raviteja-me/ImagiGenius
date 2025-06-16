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

        <header className="absolute top-0 left-0 right-0 p-6 flex justify-center md:justify-start">
          <Logo className="text-foreground" textSize="text-3xl" />
        </header>

        <main className="z-10 flex flex-col items-center">
          <div className="mb-8 animate-pulse-glow">
            <Wand2 size={80} className="mx-auto text-primary drop-shadow-lg" />
          </div>

          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            Welcome to <span className="text-primary">Imagi</span><span className="text-accent">Genius</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl text-balance">
            The <span className="font-semibold text-primary">world's best AI image editor</span>.
            Unleash your creativity with the power of Gemini. Transform your photos with simple chat commands.
          </p>

          <div className="mt-12 flex flex-col items-center space-y-6">
            <FileUploadButton />
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            {[
              { icon: Sparkles, title: "AI Magic", description: "Edit images with natural language. Change backgrounds, styles, and objects effortlessly." },
              { icon: Palette, title: "Creative Styles", description: "Apply artistic filters like Ghibli, sketch, contour, and more in seconds." },
              { icon: Wand2, title: "Intuitive Editing", description: "A seamless experience from upload to masterpiece. Your imagination is the only limit." },
            ].map(feature => (
              <div key={feature.title} className="flex flex-col items-center p-6 bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border/50">
                <feature.icon size={40} className="mb-4 text-primary" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ImagiGenius. All rights reserved. Powered by Gemini.
          </p>
        </footer>
      </div>
    </>
  );
}
