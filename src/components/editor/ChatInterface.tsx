"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ImageIcon, Palette, Nutzer, SquarePlus, Sparkles, MessageSquare, Eraser } from 'lucide-react';
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
  dress: Palette, // Using Palette as a generic style icon for dress
  style: Sparkles,
  object: SquarePlus,
};

const styleOptions = ["Ghibli", "Contour", "Sketch", "Blur Background", "Pixel Art", "Van Gogh", "Cyberpunk"];

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

  useEffect(() => {
    // Initialize with a system message
    if (chatHistory.length === 0) {
       setChatHistory([{ id: 'init', sender: 'system', text: 'Welcome to ImagiGenius! Select a tool and describe your edits.', timestamp: new Date() }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const addMessageToHistory = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setChatHistory(prev => [...prev, { ...message, id: crypto.randomUUID(), timestamp: new Date() }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || !currentImageSrc) {
      toast({ title: "Missing information", description: "Please ensure an image is loaded and provide a prompt.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGlobalLoading(true);
    addMessageToHistory({ sender: 'user', text: promptText, tool: activeTool });

    try {
      let resultUri: string | undefined;

      switch (activeTool) {
        case 'general':
          const generalInput: EditImageWithChatInput = { imageDataUri: currentImageSrc, chatCommand: promptText };
          const generalOutput = await editImageWithChat(generalInput);
          resultUri = generalOutput.editedImageDataUri;
          break;
        case 'background':
          const bgInput: ModifyBackgroundInput = { photoDataUri: currentImageSrc, backgroundDescription: promptText };
          const bgOutput = await modifyBackground(bgInput);
          resultUri = bgOutput.modifiedPhotoDataUri;
          break;
        case 'dress':
          const dressInput: ChangeDressStyleInput = { photoDataUri: currentImageSrc, stylePrompt: promptText };
          const dressOutput = await changeDressStyle(dressInput);
          resultUri = dressOutput.editedPhotoDataUri;
          break;
        case 'style':
          const styleInput: ApplyStyleTransferInput = { photoDataUri: currentImageSrc, style: selectedStyle + (promptText ? ` ${promptText}` : '') };
          const styleOutput = await applyStyleTransfer(styleInput);
          resultUri = styleOutput.styledPhotoDataUri;
          break;
        case 'object':
          const objectInput: AddRemoveObjectsInput = { photoDataUri: currentImageSrc, command: promptText };
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
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-headline flex items-center">
            <MessageSquare className="mr-2 text-primary" /> AI Chat Editor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setChatHistory([])} title="Clear Chat" disabled={isLoading || chatHistory.length === 0}>
            <Eraser className="mr-1 h-4 w-4" /> Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0 px-2">
        <ScrollArea className="h-full pr-2 py-2">
          <div className="space-y-4 p-2">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender !== 'user' && msg.sender !== 'system' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png?text=AI" alt="AI Avatar" data-ai-hint="robot face" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                 {msg.sender === 'system' && (
                  <Avatar className="h-8 w-8">
                     <Sparkles className="h-8 w-8 text-primary p-1 bg-primary/20 rounded-full"/>
                  </Avatar>
                )}
                <div className={`max-w-[75%] rounded-lg p-3 text-sm shadow-md ${
                  msg.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 
                  msg.sender === 'system' ? 'bg-muted text-muted-foreground w-full text-center' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  {msg.image && (
                    <div className="mt-2">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={msg.image} alt="AI Generated Image" className="rounded-md max-w-full h-auto max-h-48 object-contain" data-ai-hint="edited photography" />
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png?text=U" alt="User Avatar" data-ai-hint="person silhouette"/>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {(Object.keys(toolIcons) as AiTool[]).map(tool => (
              <Button
                key={tool}
                type="button"
                variant={activeTool === tool ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool(tool)}
                className="flex-1 text-xs sm:text-sm"
                aria-pressed={activeTool === tool}
                aria-label={`Select ${toolDisplayNames[tool]} tool`}
              >
                {React.createElement(toolIcons[tool], { className: "mr-1.5 h-4 w-4" })}
                {toolDisplayNames[tool]}
              </Button>
            ))}
          </div>

          {activeTool === 'style' && (
            <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isLoading}>
              <SelectTrigger className="w-full" aria-label="Select style for Style Transfer tool">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center space-x-2">
            <CurrentToolIcon className="h-6 w-6 text-primary flex-shrink-0" />
            <Textarea
              value={promptText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPromptText(e.target.value)}
              placeholder={`Describe your edit for "${toolDisplayNames[activeTool]}"...`}
              className="flex-grow resize-none"
              rows={2}
              disabled={isLoading || !currentImageSrc}
              aria-label="Prompt for image editing"
            />
            <Button type="submit" size="lg" disabled={isLoading || !promptText.trim() || !currentImageSrc} className="min-w-[100px]">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send'}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
