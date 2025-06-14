"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Bot, X, Sparkles, Send, Zap, Globe, Edit3, FileText, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// TypeScript interfaces
interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AIAssistantPanelProps {
  onClose: () => void;
  isTyping: boolean;
  onTypingChange: (typing: boolean) => void;
  isMobile: boolean;
}

export function AIAssistantPanel({ onClose, isTyping, onTypingChange, isMobile }: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '👋 Hey there! I\'m your AI companion powered by Gemini. Ready to help you create amazing content, translate languages, or chat about anything!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);
    onTypingChange(true);

    try {
      const recentHistory = messages.slice(-10);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          context: 'chat_assistant',
          history: recentHistory
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error('No response from AI');
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMsg);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Oops! Something went wrong: ${errorMsg}. Let's try that again! 🔄`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      onTypingChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Enhanced quick actions with better UX
  const quickActions = [
    { id: 'help', icon: Edit3, label: 'Write', prompt: 'Help me write a professional message about', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { id: 'translate', icon: Globe, label: 'Translate', prompt: 'Translate this text to Spanish: ', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { id: 'improve', icon: Sparkles, label: 'Enhance', prompt: 'Make this message better and more engaging: ', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { id: 'summarize', icon: FileText, label: 'Summarize', prompt: 'Summarize our conversation so far', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  ];

  const handleQuickAction = (prompt: string): void => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
      {/* Modern Header with Glassmorphism */}
      <div className={cn(
        "flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl",
        "shadow-sm",
        isMobile ? "p-4" : "p-4"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base">Gemini AI</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {isTyping ? 'Thinking...' : 'Online'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="hover:bg-red-500/10 hover:text-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Display with Better Styling */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Messages with Enhanced Styling */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 group",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                "relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
                message.type === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto'
                  : 'bg-white dark:bg-gray-800 border border-border/50 hover:shadow-md'
              )}>
                {message.type === 'ai' && (
                  <div className="flex items-center gap-1 mb-2 opacity-70">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-medium">Gemini</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Enhanced Loading Animation */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Gemini is crafting a response...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Enhanced Input Section */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-4">
        {/* Quick Actions with Better Design */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.prompt)}
              className={cn(
                "flex-shrink-0 h-8 text-xs font-medium transition-all duration-200 hover:scale-105",
                action.color
              )}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input Area with Modern Design */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Gemini anything... ✨"
              className={cn(
                "resize-none border-border/50 focus:border-purple-500 transition-all duration-200",
                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
                "rounded-2xl px-4 py-3 pr-12",
                isMobile 
                  ? "min-h-[48px] max-h-[120px] text-base"
                  : "min-h-[44px] max-h-[100px] text-sm"
              )}
              disabled={isLoading}
              rows={1}
            />
            <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
              {input.length}/2000
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size={isMobile ? "default" : "sm"}
            className={cn(
              "rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
              "shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105",
              isMobile ? "h-12 w-12" : "h-11 w-11"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
