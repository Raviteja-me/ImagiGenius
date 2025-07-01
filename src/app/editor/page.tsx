"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ImageCanvas from '@/components/editor/ImageCanvas';
import ChatInterface from '@/components/editor/ChatInterface';
import Logo from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Home, UploadCloud, Loader2, Undo, Redo, Download, User, Sparkles, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AuthLoading from '@/components/auth/AuthLoading';
import { useIsMobile } from '@/hooks/use-mobile';

const DEFAULT_PLACEHOLDER_IMAGE = "https://placehold.co/800x600.png?text=Start+Editing!";
const MAX_HISTORY_SIZE = 10;

export default function EditorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoadingPersistence, setIsLoadingPersistence] = useState(true);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [history, setHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);

  // Auto-hide chat on mobile when not in use
  useEffect(() => {
    if (!isMobile) {
      setShowChat(true);
    }
  }, [isMobile]);

  useEffect(() => {
    try {
      const storedImage = localStorage.getItem('uploadedImageURI_v2');
      let initialImage = storedImage || DEFAULT_PLACEHOLDER_IMAGE;
      
      setImageSrc(initialImage);
      setHistory([initialImage]);
      setCurrentHistoryIndex(0);

      if (!storedImage) {
        toast({
          title: "No Uploaded Image Found",
          description: "Starting with a placeholder. You can describe your desired image to the AI or upload a new one.",
        });
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setImageSrc(DEFAULT_PLACEHOLDER_IMAGE);
      setHistory([DEFAULT_PLACEHOLDER_IMAGE]);
      setCurrentHistoryIndex(0);
      toast({
        title: "Storage Access Error",
        description: "Could not access local image storage. Using a placeholder.",
        variant: "destructive",
      });
    }
    setIsLoadingPersistence(false);
  }, [toast]);

  const updateImageAndHistory = useCallback((newImageSrc: string) => {
    setImageSrc(newImageSrc);
    try {
      localStorage.setItem('uploadedImageURI_v2', newImageSrc);
    } catch (error) {
      console.error("Error saving updated image to localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Could not save updated image to local storage. It might be too large.",
        variant: "destructive",
      });
    }

    setHistory(prevHistory => {
      const newHistoryBase = prevHistory.slice(0, currentHistoryIndex + 1);
      let updatedHistory = [...newHistoryBase, newImageSrc];
      if (updatedHistory.length > MAX_HISTORY_SIZE) {
        updatedHistory = updatedHistory.slice(-MAX_HISTORY_SIZE);
      }
      setCurrentHistoryIndex(updatedHistory.length - 1);
      return updatedHistory;
    });
  }, [currentHistoryIndex, toast]);


  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      const newImageSrc = history[newIndex];
      setImageSrc(newImageSrc);
      try {
        localStorage.setItem('uploadedImageURI_v2', newImageSrc);
      } catch (error) {
        console.error("Error saving undone image to localStorage:", error);
      }
    }
  }, [currentHistoryIndex, history]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      const newImageSrc = history[newIndex];
      setImageSrc(newImageSrc);
      try {
        localStorage.setItem('uploadedImageURI_v2', newImageSrc);
      } catch (error) {
        console.error("Error saving redone image to localStorage:", error);
      }
    }
  }, [currentHistoryIndex, history]);

  const handleDownload = useCallback(() => {
    if (imageSrc) {
      if (imageSrc.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = imageSrc;
        const fileExtension = imageSrc.split(';')[0].split('/')[1] || 'png';
        link.download = `imagigenius-edit.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Image Downloaded", description: `Your masterpiece is saving as imagigenius-edit.${fileExtension}`});
      } else if (imageSrc.startsWith('http')) {
        // For external URLs, try to fetch and then download, or open in new tab
        // This is a simplified approach; robust fetching might need server-side help for CORS
        fetch(imageSrc)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileExtension = blob.type.split('/')[1] || 'png';
            link.download = `imagigenius-edit.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast({ title: "Image Downloaded", description: `Your masterpiece is saving as imagigenius-edit.${fileExtension}`});
          })
          .catch(error => {
            console.error("Error downloading image:", error);
            toast({ title: "Download Error", description: "Could not download the image. Try opening it in a new tab and saving.", variant: "destructive" });
            // Fallback for direct links
            window.open(imageSrc, '_blank');
          });
      } else {
         toast({ title: "Download Error", description: "Cannot download this image type.", variant: "destructive" });
      }
    } else {
      toast({ title: "No Image", description: "There's no image to download.", variant: "destructive" });
    }
  }, [imageSrc, toast]);


  if (isLoadingPersistence || authLoading) {
    return <AuthLoading />;
  }

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  return (
    <div className="flex h-screen max-h-screen flex-col bg-gradient-animated">
      {/* Mobile Header */}
      <header className="flex items-center justify-between p-3 border-b border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
        <Logo className="text-foreground" textSize="text-xl sm:text-2xl" />
        
        {/* Mobile: Show chat toggle and essential buttons */}
        {isMobile ? (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleUndo} disabled={!canUndo || isGlobalLoading} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRedo} disabled={!canRedo || isGlobalLoading} title="Redo">
              <Redo className="h-4 w-4" />
            </Button>
            <Button 
              variant={showChat ? "default" : "outline"} 
              size="icon" 
              onClick={() => setShowChat(!showChat)}
              title="Toggle Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload} disabled={isGlobalLoading || !imageSrc || imageSrc === DEFAULT_PLACEHOLDER_IMAGE} title="Download Image">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          /* Desktop: Show all buttons */
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handleUndo} disabled={!canUndo || isGlobalLoading} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRedo} disabled={!canRedo || isGlobalLoading} title="Redo">
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGlobalLoading || !imageSrc || imageSrc === DEFAULT_PLACEHOLDER_IMAGE} title="Download Image">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Home
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
               <Link href="/">
                <UploadCloud className="mr-2 h-4 w-4" /> New Upload
              </Link>
            </Button>
          </div>
        )}
      </header>

      <main className="flex-grow h-full min-h-0 flex overflow-hidden">
        {/* Mobile Layout */}
        {isMobile ? (
          <div className="w-full flex flex-col">
            {/* Image Canvas - Takes full width when chat is hidden */}
            <div className={`flex-1 flex items-center justify-center p-2 bg-background/30 relative ${showChat ? 'h-1/2' : 'h-full'}`}>
              {isGlobalLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              <ImageCanvas imageSrc={imageSrc} />
            </div>
            
            {/* Chat Interface - Slides up from bottom on mobile */}
            {showChat && (
              <div className="h-1/2 bg-card/60 backdrop-blur-md border-t border-border/50">
                <ChatInterface
                  currentImageSrc={imageSrc}
                  onImageUpdate={updateImageAndHistory}
                  setGlobalLoading={setIsGlobalLoading}
                />
              </div>
            )}
          </div>
        ) : (
          /* Desktop Layout - Side by side */
          <div className="w-full h-full min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 h-full flex items-center justify-center p-4 bg-background/30 relative">
               {isGlobalLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              <ImageCanvas imageSrc={imageSrc} />
            </div>
            <div className="lg:col-span-1 h-full min-h-0 flex flex-col bg-card/60 backdrop-blur-md lg:border-l border-border/50">
              <ChatInterface
                currentImageSrc={imageSrc}
                onImageUpdate={updateImageAndHistory}
                setGlobalLoading={setIsGlobalLoading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
