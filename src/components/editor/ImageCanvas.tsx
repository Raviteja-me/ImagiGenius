"use client";

import Image from 'next/image';
import { ImageIcon, AlertTriangle } from 'lucide-react';

interface ImageCanvasProps {
  imageSrc: string | null;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ imageSrc }) => {
  if (!imageSrc) {
    return (
      <div className="w-full aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border p-4">
        <ImageIcon size={48} className="mb-3 sm:mb-4 sm:w-16 sm:h-16" />
        <p className="text-base sm:text-lg font-medium text-center">No image loaded</p>
        <p className="text-sm text-center mt-1">Upload an image or use the chat to generate one.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] bg-muted/30 rounded-lg overflow-hidden shadow-lg border border-border flex items-center justify-center p-2 sm:p-4">
       {/* Using <img> for data URIs as next/image might have issues with very long data URIs or requires specific loader config */}
       {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={imageSrc} 
        alt="Editable canvas" 
        className="max-w-full max-h-full object-contain rounded touch-manipulation"
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          maxWidth: '100%'
        }}
        data-ai-hint="edited photography" // Generic hint as content is dynamic
      />
    </div>
  );
};

export default ImageCanvas;
