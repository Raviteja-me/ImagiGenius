"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageCanvas from '@/components/editor/ImageCanvas';
import ChatInterface from '@/components/editor/ChatInterface';
import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Home, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/800x600.png?text=Start+Editing!"; // data-ai-hint will be on ImageCanvas component

export default function EditorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoadingPersistence, setIsLoadingPersistence] = useState(true); // For localStorage loading
  const [isGlobalLoading, setIsGlobalLoading] = useState(false); // For AI operations
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem('uploadedImageURI_v2');
      if (storedImage) {
        setImageSrc(storedImage);
      } else {
        // If no image in local storage, set a default placeholder or guide user
        setImageSrc(DEFAULT_PLACEHOLDER_IMAGE);
        toast({
          title: "No Uploaded Image Found",
          description: "Starting with a placeholder. You can describe your desired image to the AI or upload a new one.",
        });
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setImageSrc(DEFAULT_PLACEHOLDER_IMAGE); // Fallback if localStorage fails
      toast({
        title: "Storage Access Error",
        description: "Could not access local image storage. Using a placeholder.",
        variant: "destructive",
      });
    }
    setIsLoadingPersistence(false);
  }, [toast]);

  const handleImageUpdate = (newImageSrc: string) => {
    setImageSrc(newImageSrc);
    try {
      localStorage.setItem('uploadedImageURI_v2', newImageSrc); // Update localStorage
    } catch (error) {
      console.error("Error saving updated image to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save updated image to local storage. It might be too large.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingPersistence) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold">Loading your masterpiece...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen flex-col bg-gradient-animated">
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
        <Logo className="text-foreground" textSize="text-2xl" />
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Home
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
             <Link href="/"> {/* Redirect to home to re-upload */}
              <UploadCloud className="mr-2 h-4 w-4" /> New Upload
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
        <div className="lg:col-span-2 h-full flex items-center justify-center p-4 bg-background/30">
           {isGlobalLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          <ImageCanvas imageSrc={imageSrc} />
        </div>
        <div className="lg:col-span-1 h-full flex flex-col bg-card/60 backdrop-blur-md lg:border-l border-border/50">
          <ChatInterface
            currentImageSrc={imageSrc}
            onImageUpdate={handleImageUpdate}
            setGlobalLoading={setIsGlobalLoading}
          />
        </div>
      </main>
    </div>
  );
}
