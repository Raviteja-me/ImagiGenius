"use client";

import { UploadCloud, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const FileUploadButton = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., PNG, JPG, GIF).",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        try {
          localStorage.setItem('uploadedImageURI_v2', dataUrl); // Use a versioned key
          router.push('/editor');
        } catch (error) {
          console.error("Error saving to localStorage:", error);
          toast({
            title: "Storage Error",
            description: "Could not save image. It might be too large for local storage.",
            variant: "destructive",
          });
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={isUploading}
      />
      <Button
        onClick={handleClick}
        size="lg"
        className="group relative min-w-[280px] transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary py-8 px-10 text-xl font-semibold rounded-xl shadow-lg animate-pulse-glow"
        disabled={isUploading}
        aria-label="Upload an image to start editing"
      >
        {isUploading ? (
          <>
            <Sparkles className="mr-3 h-6 w-6 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <UploadCloud className="mr-3 h-7 w-7 transition-transform duration-300 group-hover:translate-y-[-2px]" />
            Upload Image &amp; Create Magic
          </>
        )}
      </Button>
       <p className="mt-4 text-sm text-muted-foreground">
        Or start with a <a href="/editor" className="underline hover:text-accent">blank canvas</a> and generate with AI.
      </p>
    </>
  );
};

export default FileUploadButton;
