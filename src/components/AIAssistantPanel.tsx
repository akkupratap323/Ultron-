"use client";

import { useState } from "react";
import { Loader2, Bot, X, Sparkles } from "lucide-react";
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
      content: 'Hi! I\'m your AI assistant powered by Gemini. I can help you write better messages, translate text, or answer any questions you have!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
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

  // Quick action handlers
  const handleQuickAction = (action: string): void => {
    switch (action) {
      case 'help':
        setInput('Help me write a professional message');
        break;
      case 'translate':
        setInput('Translate this text to Spanish: ');
        break;
      case 'improve':
        setInput('Improve this message: ');
        break;
      case 'summarize':
        setInput('Summarize this conversation');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* AI Header */}
      <div className={cn(
        "flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm",
        isMobile ? "p-4" : "p-3"
      )}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-purple-500" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <span className="font-medium text-sm">Gemini AI Assistant</span>
            {isMobile && (
              <p className="text-xs text-muted-foreground">
                {isTyping ? 'Thinking...' : 'Powered by Google Gemini'}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className={cn("flex-1", isMobile ? "p-4" : "p-3")}>
        <div className={cn("space-y-3", isMobile && "space-y-4")}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "rounded-lg text-sm",
                  isMobile ? "max-w-[85%] p-3" : "max-w-[80%] p-2",
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border border-border/50'
                )}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-1 mb-1 opacity-70">
                    <Bot className="h-3 w-3" />
                    <span className="text-xs font-medium">Gemini</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={cn(
                "bg-muted border border-border/50 rounded-lg",
                isMobile ? "p-3" : "p-2"
              )}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Gemini is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* AI Input */}
      <div className={cn(
        "border-t border-border bg-background/95 backdrop-blur-sm",
        isMobile ? "p-4" : "p-3"
      )}>
        {/* Quick Actions */}
        <div className="flex gap-1 mb-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('help')}
            className="text-xs h-7"
          >
            💬 Help Write
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('translate')}
            className="text-xs h-7"
          >
            🌐 Translate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('improve')}
            className="text-xs h-7"
          >
            ✨ Improve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('summarize')}
            className="text-xs h-7"
          >
            📝 Summarize
          </Button>
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Gemini anything..."
            className={cn(
              "flex-1 resize-none text-sm border-border/50 focus:border-primary",
              isMobile 
                ? "min-h-[44px] max-h-[120px] text-base"
                : "min-h-[36px] max-h-[100px]"
            )}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size={isMobile ? "default" : "sm"}
            className={cn(
              "self-end",
              isMobile && "px-4 py-2 h-[44px]"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
