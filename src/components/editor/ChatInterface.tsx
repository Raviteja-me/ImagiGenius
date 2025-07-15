"use client";

import * as React from 'react';
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, ImageIcon, Palette, SquarePlus, Sparkles, MessageSquare, Eraser, UploadCloud, XCircle, ChevronDown, Settings2 } from 'lucide-react';
import { modifyBackground, type ModifyBackgroundInput } from '@/ai/flows/modify-background';
import { applyStyleTransfer, type ApplyStyleTransferInput } from '@/ai/flows/apply-style-transfer';
import { addRemoveObjects, type AddRemoveObjectsInput } from '@/ai/flows/add-remove-objects';
import { editImageWithChat, type EditImageWithChatInput } from '@/ai/flows/edit-image-with-chat';
import { changeDressStyle, type ChangeDressStyleInput } from '@/ai/flows/change-dress-style';
import { generateUUID } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { incrementUsageNumber } from '@/lib/firebase';
import AuthModal from '@/components/auth/AuthModal';

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
  const { user, userData, checkUsageLimit } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  const [referenceImageSrc, setReferenceImageSrc] = useState<string | null>(null);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  const referenceFileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customGeminiApiKey, setCustomGeminiApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Load custom API key from localStorage on mount
  useEffect(() => {
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') : null;
    if (storedKey) {
      setCustomGeminiApiKey(storedKey);
      setApiKeyInput(storedKey);
    }
  }, []);

  // Save API key to localStorage
  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      if (apiKeyInput.trim()) {
        localStorage.setItem('geminiApiKey', apiKeyInput.trim());
        setCustomGeminiApiKey(apiKeyInput.trim());
      } else {
        localStorage.removeItem('geminiApiKey');
        setCustomGeminiApiKey(null);
      }
    }
    setShowApiKeyModal(false);
    toast({ title: 'Gemini API Key Updated', description: apiKeyInput.trim() ? 'Custom API key saved.' : 'Reverted to default API key.' });
  };

  useEffect(() => {
    if (chatHistory.length === 0) {
       setChatHistory([
         { id: 'init', sender: 'system', text: 'Welcome to ImagiGenius! Select a tool and describe your edits. The "Add/Remove Object" tool can use an optional reference image to guide the AI.', timestamp: new Date() },
         { id: 'test1', sender: 'ai', text: 'I\'m ready to help you edit your images! Try uploading an image and describing what you\'d like to change.', timestamp: new Date() },
         { id: 'test2', sender: 'user', text: 'How do I use the different tools?', timestamp: new Date() },
         { id: 'test3', sender: 'ai', text: 'Great question! Here\'s how to use each tool:\n\n• General Edit: Describe any changes you want\n• Background: Change the image background\n• Dress Style: Modify clothing styles\n• Artistic Style: Apply artistic filters\n• Add/Remove Object: Add or remove objects from the image\n\nJust select a tool and describe what you want!', timestamp: new Date() },
         { id: 'test4', sender: 'user', text: 'Can I use multiple tools on the same image?', timestamp: new Date() },
         { id: 'test5', sender: 'ai', text: 'Absolutely! You can apply multiple edits to the same image. Each edit builds upon the previous one, so you can:\n\n1. Start with a background change\n2. Then apply an artistic style\n3. Finally add or remove objects\n\nThe changes will accumulate, giving you full creative control!', timestamp: new Date() },
         { id: 'test6', sender: 'user', text: 'What about the scrolling?', timestamp: new Date() },
         { id: 'test7', sender: 'ai', text: 'The chat area should scroll when you have many messages. Try scrolling up and down to see the scroll functionality in action!', timestamp: new Date() },
         { id: 'test8', sender: 'user', text: 'Is there a scroll to bottom button?', timestamp: new Date() },
         { id: 'test9', sender: 'ai', text: 'Yes! When you scroll up from the bottom, a "Scroll to Bottom" button will appear in the bottom-right corner. Click it to quickly return to the latest messages.', timestamp: new Date() }
       ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Handle scroll events to show/hide scroll to bottom button
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addMessageToHistory = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setChatHistory(prev => [...prev, { ...message, id: generateUUID(), timestamp: new Date() }]);
  };

  const handleReferenceImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file for the reference.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (50MB limit)
      const MAX_FILE_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `Reference image must be less than 50MB. Your file is ${Math.round(file.size / (1024 * 1024))}MB.`,
          variant: "destructive",
        });
        return;
      }

      setIsUploadingReference(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImageSrc(e.target?.result as string);
        setIsUploadingReference(false);
        toast({ title: "Reference Image Loaded", description: "Ready for 'Add/Remove Object' guidance." });
      };
      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Could not read the reference image file.", variant: "destructive" });
        setIsUploadingReference(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Check usage limit before proceeding
    const usageCheck = await checkUsageLimit();
    
    if (!usageCheck.canGenerate) {
      toast({ 
        title: "Daily Limit Reached", 
        description: usageCheck.message || "You've reached your daily limit. Come back tomorrow!", 
        variant: "destructive" 
      });
      return;
    }

    const finalPromptText = promptText.trim();

     if (!currentImageSrc) {
      toast({ title: "Missing image", description: "Please ensure an image is loaded in the canvas.", variant: "destructive" });
      return;
    }

    let userMessage = finalPromptText;
    let effectivePrompt = finalPromptText;

    switch (activeTool) {
        case 'general':
        case 'background':
        case 'dress':
             if (!effectivePrompt) {
                toast({ title: "Missing prompt", description: `Please describe the ${toolDisplayNames[activeTool].toLowerCase()} you want.`, variant: "destructive" });
                return;
            }
            break;
        case 'style':
            if (!selectedStyle && !effectivePrompt) {
                toast({ title: "Missing style information", description: "Please select a style or provide a style description.", variant: "destructive" });
                return;
            }
            effectivePrompt = selectedStyle + (effectivePrompt ? ` ${effectivePrompt}` : '');
            userMessage = `Style: ${effectivePrompt}`;
            break;
        case 'object':
            if (!effectivePrompt) {
                toast({ title: "Missing command", description: "Please describe what to add or remove.", variant: "destructive" });
                return;
            }
            if (referenceImageSrc) {
              userMessage = `${effectivePrompt} (Using reference image)`;
            }
            break;
        default:
          // Should not happen
          return;
    }

    setIsLoading(true);
    setGlobalLoading(true);
    
    addMessageToHistory({ sender: 'user', text: userMessage, tool: activeTool });

    try {
      let resultUri: string | undefined;

      switch (activeTool) {
        case 'general':
          const generalInput: EditImageWithChatInput = { imageDataUri: currentImageSrc, chatCommand: effectivePrompt };
          const generalOutput = await editImageWithChat(generalInput);
          resultUri = generalOutput.editedImageDataUri;
          break;
        case 'background':
          const bgInput: ModifyBackgroundInput = { photoDataUri: currentImageSrc, backgroundDescription: effectivePrompt };
          const bgOutput = await modifyBackground(bgInput);
          resultUri = bgOutput.modifiedPhotoDataUri;
          break;
        case 'dress':
          const dressInput: ChangeDressStyleInput = { photoDataUri: currentImageSrc, stylePrompt: effectivePrompt };
          const dressOutput = await changeDressStyle(dressInput);
          resultUri = dressOutput.editedPhotoDataUri;
          break;
        case 'style':
          const styleInput: ApplyStyleTransferInput = { 
            photoDataUri: currentImageSrc, 
            style: effectivePrompt,
          };
          const styleOutput = await applyStyleTransfer(styleInput);
          resultUri = styleOutput.styledPhotoDataUri;
          break;
        case 'object':
          const objectInput: AddRemoveObjectsInput = { 
            photoDataUri: currentImageSrc, 
            command: effectivePrompt,
            referencePhotoDataUri: referenceImageSrc || undefined,
          };
          const objectOutput = await addRemoveObjects(objectInput);
          resultUri = objectOutput.modifiedPhotoDataUri;
          break;
        default:
          throw new Error('Invalid tool selected');
      }

      if (resultUri) {
        // Increment usage counter
        try {
          await incrementUsageNumber(user.uid);
          // Show remaining generations
          const updatedUsageCheck = await checkUsageLimit();
          const remainingMessage = updatedUsageCheck.remaining > 0 
            ? ` ${updatedUsageCheck.remaining} generations remaining today.`
            : " No more generations today.";
          
          onImageUpdate(resultUri);
          addMessageToHistory({ sender: 'ai', text: `${toolDisplayNames[activeTool]} applied successfully!${remainingMessage}`, image: resultUri });
          toast({ title: "Edit Applied!", description: `Your image has been updated.${remainingMessage}` });
        } catch (error) {
          // Don't fail the operation if usage tracking fails
          onImageUpdate(resultUri);
          addMessageToHistory({ sender: 'ai', text: `${toolDisplayNames[activeTool]} applied successfully!`, image: resultUri });
          toast({ title: "Edit Applied!", description: "Your image has been updated." });
        }
      } else {
        throw new Error('AI did not return an image.');
      }
      setPromptText('');
      if(activeTool === 'object' && referenceImageSrc) {
        // Optionally clear reference image after use. For now, let's keep it
        // setReferenceImageSrc(null); 
      }
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
    <>
    <Card className="w-full h-full flex flex-col min-h-0 shadow-2xl border-none bg-card/70 backdrop-blur-md">
        <CardHeader className="p-4 border-b border-border/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center">
            <MessageSquare className="mr-2 text-primary h-5 w-5" /> AI Chat Editor
          </CardTitle>
            <div className="flex items-center gap-2">
              {/* Settings (Gear) Icon for Gemini API Key */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowApiKeyModal(true)}
                title="Gemini API Key Settings"
                className="h-8 w-8"
                disabled={isLoading}
              >
                <Settings2 className="h-5 w-5" />
              </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            setChatHistory([{ id: 'init-cleared', sender: 'system', text: 'Chat cleared. Select a tool and describe your edits. The "Add/Remove Object" tool can use an optional reference image.', timestamp: new Date() }]);
            setPromptText('');
            setReferenceImageSrc(null); 
          }} title="Clear Chat & Reference" disabled={isLoading}>
            <Eraser className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
            </div>
        </div>
      </CardHeader>
        
        <CardContent className="flex flex-col flex-grow min-h-0 overflow-hidden p-2 sm:p-4 relative">
          {/* Fixed height scrollable chat area - removed custom scrollbar for mobile compatibility */}
          <div 
            className="flex-grow min-h-0 w-full overflow-y-auto border border-border/20 rounded-md bg-background/50 mb-0"
            ref={scrollAreaRef}
            onScroll={handleScroll}
            style={{ maxHeight: '100%' }}
          >
            <div className="p-2 sm:p-4 space-y-3">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                    <AvatarImage src="https://placehold.co/40x40.png?text=AI" alt="AI Avatar" data-ai-hint="robot face" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                 {msg.sender === 'system' && (
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                     <Sparkles className="h-full w-full text-primary p-1 bg-primary/20 rounded-full"/>
                  </Avatar>
                )}
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm shadow-md break-words ${
                  msg.sender === 'user' ? 'bg-primary text-primary-foreground ml-auto' :
                  msg.sender === 'system' ? 'bg-muted/70 text-muted-foreground w-full text-center text-xs py-1.5' : 'bg-secondary text-secondary-foreground'
                }`}>
                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                  {msg.image && (
                    <div className="mt-1.5">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.image} alt="AI Generated Image" className="rounded-md max-w-full h-auto max-h-32 sm:max-h-40 object-contain" data-ai-hint="edited photography" />
                    </div>
                  )}
                  <p className={`text-xs opacity-70 mt-1 ${msg.sender === 'user' ? 'text-right' : msg.sender === 'system' ? 'hidden' : 'text-right'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {msg.sender === 'user' && (
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                      <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} data-ai-hint="person silhouette"/>
                      <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* No extra margin or padding below chat area. The scroll-to-bottom button remains absolutely positioned. */}
          {showScrollToBottom && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-4 right-4 h-8 w-8 rounded-full p-0 shadow-lg z-10"
              title="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
      </CardContent>
        
        <CardFooter className="p-2 sm:p-3 pb-4 sm:pb-6 border-t border-border/30 flex-shrink-0">
        <form onSubmit={handleSubmit} className="w-full space-y-1.5 mt-0">
            {/* Tool buttons - Hidden on mobile, show on desktop */}
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-0.5 mb-0">
            {(Object.keys(toolIcons) as AiTool[]).map(tool => (
              <Button
                key={tool}
                type="button"
                variant={activeTool === tool ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveTool(tool);
                   if (tool !== 'object') {
                     setReferenceImageSrc(null); // Clear reference if not object tool
                   }
                }}
                  className="flex-1 text-xs px-0.5 sm:px-1 justify-center h-7 sm:h-8 min-h-0"
                aria-pressed={activeTool === tool}
                aria-label={`Select ${toolDisplayNames[tool]} tool`}
              >
                  {React.createElement(toolIcons[tool], { className: "mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" })}
                  <span className="truncate hidden sm:inline">{toolDisplayNames[tool]}</span>
                  <span className="truncate sm:hidden">{toolDisplayNames[tool].split(' ')[0]}</span>
              </Button>
            ))}
          </div>

            {/* Mobile: Show current tool name */}
            <div className="sm:hidden text-center py-2">
              <span className="text-sm font-medium text-muted-foreground">
                Current Tool: {toolDisplayNames[activeTool]}
              </span>
            </div>

          {activeTool === 'style' && (
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
          )}
          
          {activeTool === 'object' && (
            <div className="space-y-2">
              <input
                type="file"
                ref={referenceFileInputRef}
                onChange={handleReferenceImageUpload}
                className="hidden"
                accept="image/*"
                disabled={isLoading || isUploadingReference}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full h-9 text-sm" 
                onClick={() => referenceFileInputRef.current?.click()}
                disabled={isLoading || isUploadingReference}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {isUploadingReference ? "Uploading..." : referenceImageSrc ? "Change Reference Image" : "Upload Reference Image (Optional)"}
              </Button>

              {referenceImageSrc && (
                <div className="relative group mt-2 p-2 border border-dashed rounded-md">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={referenceImageSrc} alt="Reference for object task" className="max-w-full h-20 object-contain rounded-md mx-auto" data-ai-hint="object reference" />
                  <Button 
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity"
                    onClick={() => setReferenceImageSrc(null)}
                    title="Remove reference image"
                    disabled={isLoading}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}


          <div className="flex items-end space-x-2">
            <CurrentToolIcon className="h-5 w-5 text-primary flex-shrink-0 mb-2" />
            <Textarea
              value={promptText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPromptText(e.target.value)}
              placeholder={
                activeTool === 'style' 
                ? `Describe style (e.g., "${selectedStyle}") or add details...` 
                : activeTool === 'object'
                ? 'Describe object to add/remove (e.g., "add a cat on the sofa" or "remove the person on the left")'
                : `Describe your edit for "${toolDisplayNames[activeTool]}"...`
              }
              className="flex-grow resize-none text-sm"
              rows={2}
              disabled={isLoading || !currentImageSrc}
              aria-label="Prompt for image editing"
            />
            <Button
              type="submit"
              size="lg"
              disabled={
                isLoading || 
                !currentImageSrc ||
                // Disable if prompt is empty for tools that strictly require it
                ( (activeTool === 'general' || activeTool === 'background' || activeTool === 'dress' || activeTool === 'object') && !promptText.trim() ) ||
                // Disable for style tool if both selectedStyle AND promptText are empty
                ( activeTool === 'style' && !selectedStyle && !promptText.trim() )
              }
              className="min-w-[80px] h-auto self-stretch text-sm px-4 py-2"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send'}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      {/* Gemini API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              onClick={() => setShowApiKeyModal(false)}
              aria-label="Close"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-2">Gemini API Key</h2>
            <p className="text-xs text-muted-foreground mb-4">Enter your own Gemini API key to use it for AI editing. Leave blank to use the default key.</p>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm mb-3 bg-background"
              placeholder="Paste your Gemini API key here..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setApiKeyInput(customGeminiApiKey || ''); setShowApiKeyModal(false); }}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleSaveApiKey}>Save</Button>
            </div>
            {customGeminiApiKey && (
              <p className="text-xs text-green-600 mt-2">Custom API key in use.</p>
            )}
            {!customGeminiApiKey && (
              <p className="text-xs text-yellow-600 mt-2">Using default API key.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;

