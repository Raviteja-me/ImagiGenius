"use client";

import { UploadCloud, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

const FileUploadButton = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      // Check file type
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a supported image file (JPEG, PNG, WebP, GIF, BMP).",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `File size must be less than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`,
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        try {
          localStorage.setItem('uploadedImageURI_v2', dataUrl);
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
        className="group relative min-w-[280px] sm:min-w-[320px] transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary py-6 sm:py-8 px-6 sm:px-10 text-lg sm:text-xl font-semibold rounded-xl shadow-lg animate-pulse-glow"
        disabled={isUploading}
        aria-label="Upload an image to start editing"
      >
        {isUploading ? (
          <>
            <Sparkles className="mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <UploadCloud className="mr-3 h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300 group-hover:translate-y-[-2px]" />
            <span className="hidden sm:inline">Upload Image &amp; Create Magic</span>
            <span className="sm:hidden">Upload &amp; Edit</span>
          </>
        )}
      </Button>
      <p className="mt-4 text-sm text-muted-foreground text-center px-4">
        Supports JPEG, PNG, WebP, GIF, BMP up to 50MB. Or start with a{" "}
        <a href="/editor" className="underline hover:text-accent">blank canvas</a> and generate with AI.
      </p>
    </>
  );
};

export default FileUploadButton;
