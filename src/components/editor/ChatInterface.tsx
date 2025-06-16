
"use client";

import * as React from 'react';
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Keep for potential future use, but not directly for ref image upload
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ImageIcon, Palette, SquarePlus, Sparkles, MessageSquare, Eraser, Upload, X } from 'lucide-react'; 
import { modifyBackground, type ModifyBackgroundInput } from '@/ai/flows/modify-background';
import { applyStyleTransfer, type ApplyStyleTransferInput } from '@/ai/flows/apply-style-transfer';
import { addRemoveObjects, type AddRemoveObjectsInput } from '@/ai/flows/add-remove-objects';
import { editImageWithChat, type EditImageWithChatInput } from '@/ai/flows/edit-image-with-chat';
import { changeDressStyle, type ChangeDressStyleInput } from '@/ai/flows/change-dress-style';

type AiTool = 'general' | 'background' | 'dress' | 'style' | 'object';
const toolDisplayNames: Record<AiTool, string> = {
  general: 'General Edit',
  background: 'Background',
  dress: 'Dress Style',
  style: 'Artistic Style',
  object: 'Add/Remove Object',
};
const toolIcons: Record<AiTool, React.ElementType> = {
  general: Wand2,
  background: ImageIcon,
  dress: Palette,
  style: Sparkles,
  object: SquarePlus,
};

const styleOptions = ["Ghibli", "Contour", "Sketch", "Blur Background", "Pixel Art", "Van Gogh", "Cyberpunk", "Impressionistic", "Watercolor", "Oil Painting"];

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text?: string;
  image?: string;
  tool?: AiTool;
  timestamp: Date;
}

interface ChatInterfaceProps {
  currentImageSrc: string | null;
  onImageUpdate: (newImageSrc: string) => void;
  setGlobalLoading: (isLoading: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentImageSrc, onImageUpdate, setGlobalLoading }) => {
  const [activeTool, setActiveTool] = useState<AiTool>('general');
  const [promptText, setPromptText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>(styleOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const [referenceImageSrc, setReferenceImageSrc] = useState<string | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (chatHistory.length === 0) {
       setChatHistory([{ id: 'init', sender: 'system', text: 'Welcome to ImagiGenius! Select a tool and describe your edits. For "Artistic Style", you can also upload a reference image.', timestamp: new Date() }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reset reference image if tool changes from 'style'
    if (activeTool !== 'style' && referenceImageSrc) {
      setReferenceImageSrc(null);
    }
  }, [activeTool, referenceImageSrc]);


  const addMessageToHistory = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setChatHistory(prev => [...prev, { ...message, id: crypto.randomUUID(), timestamp: new Date() }]);
  };

  const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingReference(true);
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file for the reference style.",
          variant: "destructive",
        });
        setIsUploadingReference(false);
        if (referenceFileInputRef.current) referenceFileInputRef.current.value = ""; // Reset file input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImageSrc(e.target?.result as string);
        toast({ title: "Reference Image Loaded", description: "The style reference image has been loaded." });
        setIsUploadingReference(false);
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the reference image file.",
          variant: "destructive",
        });
        setIsUploadingReference(false);
      };
      reader.readAsDataURL(file);
      if (referenceFileInputRef.current) referenceFileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleRemoveReferenceImage = () => {
    setReferenceImageSrc(null);
    if (referenceFileInputRef.current) {
      referenceFileInputRef.current.value = ""; // Clear the file input
    }
    toast({ title: "Reference Image Removed" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalPromptText = (activeTool === 'style' && referenceImageSrc && !promptText.trim() && selectedStyle === styleOptions[0]) 
                             ? "Apply the style of the reference image." // Default prompt if only ref image
                             : promptText.trim();

    if (!finalPromptText && activeTool !== 'style' && !referenceImageSrc) {
        toast({ title: "Missing prompt", description: "Please provide a prompt for the edit.", variant: "destructive" });
        return;
    }
     if (!currentImageSrc) {
      toast({ title: "Missing image", description: "Please ensure an image is loaded.", variant: "destructive" });
      return;
    }


    setIsLoading(true);
    setGlobalLoading(true);
    
    let userMessage = finalPromptText;
    if (activeTool === 'style') {
      userMessage = `Style: ${selectedStyle}. ${finalPromptText}`;
      if (referenceImageSrc) {
        userMessage += " (using reference image)";
      }
    }
    addMessageToHistory({ sender: 'user', text: userMessage, tool: activeTool });


    try {
      let resultUri: string | undefined;

      switch (activeTool) {
        case 'general':
          const generalInput: EditImageWithChatInput = { imageDataUri: currentImageSrc, chatCommand: finalPromptText };
          const generalOutput = await editImageWithChat(generalInput);
          resultUri = generalOutput.editedImageDataUri;
          break;
        case 'background':
          const bgInput: ModifyBackgroundInput = { photoDataUri: currentImageSrc, backgroundDescription: finalPromptText };
          const bgOutput = await modifyBackground(bgInput);
          resultUri = bgOutput.modifiedPhotoDataUri;
          break;
        case 'dress':
          const dressInput: ChangeDressStyleInput = { photoDataUri: currentImageSrc, stylePrompt: finalPromptText };
          const dressOutput = await changeDressStyle(dressInput);
          resultUri = dressOutput.editedPhotoDataUri;
          break;
        case 'style':
          const styleInput: ApplyStyleTransferInput = { 
            photoDataUri: currentImageSrc, 
            style: selectedStyle + (finalPromptText ? ` ${finalPromptText}` : ''),
            referencePhotoDataUri: referenceImageSrc || undefined,
          };
          const styleOutput = await applyStyleTransfer(styleInput);
          resultUri = styleOutput.styledPhotoDataUri;
          break;
        case 'object':
          const objectInput: AddRemoveObjectsInput = { photoDataUri: currentImageSrc, command: finalPromptText };
          const objectOutput = await addRemoveObjects(objectInput);
          resultUri = objectOutput.modifiedPhotoDataUri;
          break;
        default:
          throw new Error('Invalid tool selected');
      }

      if (resultUri) {
        onImageUpdate(resultUri);
        addMessageToHistory({ sender: 'ai', text: `${toolDisplayNames[activeTool]} applied successfully!`, image: resultUri });
        toast({ title: "Edit Applied!", description: "Your image has been updated." });
      } else {
        throw new Error('AI did not return an image.');
      }
      setPromptText(''); 
      // Do not clear referenceImageSrc here, user might want to reuse it
    } catch (error: any) {
      console.error("AI Editing Error:", error);
      const errorMessage = error.message || "An unknown error occurred during AI processing.";
      addMessageToHistory({ sender: 'system', text: `Error: ${errorMessage}` });
      toast({ title: "AI Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const CurrentToolIcon = toolIcons[activeTool];

  return (
    <Card className="w-full h-full flex flex-col shadow-2xl border-none bg-card/70 backdrop-blur-md">
      <CardHeader className="p-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center">
            <MessageSquare className="mr-2 text-primary h-5 w-5" /> AI Chat Editor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => {
            setChatHistory([{ id: 'init-cleared', sender: 'system', text: 'Chat cleared. Select a tool and describe your edits.', timestamp: new Date() }]);
            setPromptText('');
          }} title="Clear Chat" disabled={isLoading}>
            <Eraser className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-3">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-3">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="https://placehold.co/40x40.png?text=AI" alt="AI Avatar" data-ai-hint="robot face" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                 {msg.sender === 'system' && (
                  <Avatar className="h-7 w-7">
                     <Sparkles className="h-full w-full text-primary p-1 bg-primary/20 rounded-full"/>
                  </Avatar>
                )}
                <div className={`max-w-[80%] rounded-lg p-2.5 text-sm shadow-md ${
                  msg.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto' :
                  msg.sender === 'system' ? 'bg-muted/70 text-muted-foreground w-full text-center text-xs py-1.5' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  {msg.image && (
                    <div className="mt-1.5">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.image} alt="AI Generated Image" className="rounded-md max-w-full h-auto max-h-40 object-contain" data-ai-hint="edited photography" />
                    </div>
                  )}
                  <p className={`text-xs opacity-70 mt-1 ${msg.sender === 'user' ? 'text-right' : msg.sender === 'system' ? 'hidden' : 'text-right'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="https://placehold.co/40x40.png?text=U" alt="User Avatar" data-ai-hint="person silhouette"/>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t border-border/30">
        <form onSubmit={handleSubmit} className="w-full space-y-2.5">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
            {(Object.keys(toolIcons) as AiTool[]).map(tool => (
              <Button
                key={tool}
                type="button"
                variant={activeTool === tool ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool(tool)}
                className="flex-1 text-xs px-2 justify-start sm:justify-center sm:text-sm h-9"
                aria-pressed={activeTool === tool}
                aria-label={`Select ${toolDisplayNames[tool]} tool`}
              >
                {React.createElement(toolIcons[tool], { className: "mr-1 h-4 w-4 flex-shrink-0" })}
                <span className="truncate">{toolDisplayNames[tool]}</span>
              </Button>
            ))}
          </div>

          {activeTool === 'style' && (
            <div className="space-y-2">
              <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isLoading}>
                <SelectTrigger className="w-full h-9 text-sm" aria-label="Select style for Style Transfer tool">
                  <SelectValue placeholder="Select a pre-defined style" />
                </SelectTrigger>
                <SelectContent>
                  {styleOptions.map(style => (
                    <SelectItem key={style} value={style} className="text-sm">{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-sm"
                  onClick={() => referenceFileInputRef.current?.click()}
                  disabled={isUploadingReference || isLoading}
                  data-ai-hint="upload icon"
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  {referenceImageSrc ? "Change Ref Img" : "Upload Ref Img"}
                </Button>
                 <input
                  type="file"
                  ref={referenceFileInputRef}
                  onChange={handleReferenceImageUpload}
                  className="hidden"
                  accept="image/*"
                  disabled={isUploadingReference || isLoading}
                />
                {referenceImageSrc && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    onClick={handleRemoveReferenceImage}
                    disabled={isLoading}
                    data-ai-hint="remove icon"
                    aria-label="Remove reference image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {referenceImageSrc && (
                <div className="mt-2 p-2 border border-border rounded-md bg-muted/30 flex justify-center items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={referenceImageSrc} 
                    alt="Reference style" 
                    className="max-h-24 max-w-full object-contain rounded" 
                    data-ai-hint="style reference art"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-end space-x-2">
            <CurrentToolIcon className="h-5 w-5 text-primary flex-shrink-0 mb-2" />
            <Textarea
              value={promptText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPromptText(e.target.value)}
              placeholder={activeTool === 'style' && referenceImageSrc ? `Describe how to use reference (optional)...` : `Describe your edit for "${toolDisplayNames[activeTool]}"...`}
              className="flex-grow resize-none text-sm"
              rows={2}
              disabled={isLoading || !currentImageSrc}
              aria-label="Prompt for image editing"
            />
            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading || !currentImageSrc || (!promptText.trim() && !(activeTool === 'style' && referenceImageSrc))} 
              className="min-w-[80px] h-auto self-stretch text-sm px-4 py-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send'}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
