"use client";

import { Bot, X, Sparkles, User, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIAssistantPanelProps {
  onClose: () => void;
  isTyping: boolean;
  onTypingChange: (typing: boolean) => void;
  isMobile: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  isTyping,
  onTypingChange,
  isMobile
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Enhanced AI response function with Gemini integration
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'ultron_video_calling_app'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "I'm having trouble processing your request. Please try again.";

    } catch (error) {
      console.error('AI response error:', error);
      return getIntelligentFallbackResponse(userMessage);
    }
  };

  // Enhanced fallback responses specific to your app
  const getIntelligentFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Video call specific responses
    if (lowerMessage.includes('video call') || lowerMessage.includes('call')) {
      if (lowerMessage.includes('start') || lowerMessage.includes('begin')) {
        return `🎥 **Starting a Video Call:**

1. Open a chat conversation
2. Click the video call button (📹) in the chat header
3. Wait for ZEGOCLOUD to initialize
4. Share the auto-generated invite link with participants

*Note: Make sure your camera and microphone permissions are enabled!*`;
      }
      if (lowerMessage.includes('invite') || lowerMessage.includes('share')) {
        return `🔗 **Sharing Invite Links:**

1. During an active call, click 'Invite Others' button
2. The invite link is automatically copied to clipboard
3. Share the link via any messaging platform
4. Participants can join by pasting the link in a new browser tab

*Tip: The invite link includes room ID, action=join, and username parameters.*`;
      }
      if (lowerMessage.includes('error') || lowerMessage.includes('problem')) {
        return `🔧 **Video Call Troubleshooting:**

**Common Issues & Solutions:**
• **Timeout errors**: Refresh page and try again
• **removeChild DOM error**: This is automatically handled by our error prevention system
• **Can't join invite**: Check if the link includes roomID and action=join parameters
• **Camera/mic not working**: Check browser permissions in settings

*If problems persist, try using a different browser or clearing cache.*`;
      }
      return `🎥 I can help you with video calls! I assist with starting calls, sharing invite links, troubleshooting issues, and understanding ZEGOCLOUD features. What specific video call feature do you need help with?`;
    }

    // Chat and messaging
    if (lowerMessage.includes('chat') || lowerMessage.includes('message')) {
      return `💬 **Chat Features Help:**

• **View chat history**: Scroll up in any conversation
• **Manage conversations**: Use the sidebar to switch between chats
• **Stream Chat integration**: All messages are synced in real-time
• **Notifications**: Configure in your profile settings

*This app uses Stream Chat for reliable messaging with real-time synchronization.*`;
    }

    // AI Assistant specific
    if (lowerMessage.includes('ai') || lowerMessage.includes('assistant')) {
      return `🤖 **AI Assistant Features:**

• **Video call guidance**: Step-by-step help for calls
• **Troubleshooting**: Solve technical issues
• **Feature explanations**: Learn about app capabilities
• **Quick suggestions**: Tap the suggested questions below

*I'm powered by Google Gemini AI and specifically trained for this Ultron video calling app!*`;
    }

    // App navigation and settings
    if (lowerMessage.includes('setting') || lowerMessage.includes('theme') || lowerMessage.includes('dark')) {
      return `⚙️ **App Settings & Themes:**

• **Theme switching**: Toggle between light/dark mode in your profile
• **Notifications**: Manage chat and call notifications
• **Profile settings**: Update your name and avatar
• **Privacy controls**: Manage who can call you

*The app automatically saves your preferences across sessions.*`;
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `👋 **Hello! Welcome to Ultron AI Assistant!**

I'm here to help you with:
🎥 **Video Calls** - Starting, joining, and troubleshooting
💬 **Messaging** - Chat features and history
🔧 **Technical Support** - Solving app issues
⚙️ **Settings** - Customizing your experience

What would you like help with today?`;
    }

    // Default intelligent response
    return `🤔 I understand you're asking about "${message}". 

**I can help you with:**
• 🎥 **Video Calls**: ZEGOCLOUD integration, invite links, troubleshooting
• 💬 **Messaging**: Stream Chat features, conversation management  
• 🔧 **Technical Issues**: Connection problems, DOM errors, browser compatibility
• ⚙️ **App Features**: Navigation, settings, themes

*Could you be more specific about what aspect you'd like help with?*`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue("");
    onTypingChange(true);

    try {
      const aiResponseText = await generateAIResponse(currentInput);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "🚨 I'm experiencing technical difficulties. Please try asking about video calls, messaging features, or app settings.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      onTypingChange(false);
    }
  };

  const quickSuggestions = [
    "How do I start a video call?",
    "How to share invite links?",
    "Fix video call errors",
    "Show me chat features",
    "Change app theme"
  ];

  return (
    <div className={cn(
      "h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-xl",
      isMobile && "border-l-0"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Ultron AI Assistant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Google Gemini</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 space-y-4 py-12">
            <div className="relative mx-auto w-16 h-16">
              <Sparkles className="h-16 w-16 text-emerald-500 animate-pulse" />
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Ultron AI Ready!</p>
              <p className="text-sm">Ask me about video calls, messaging, or any app features. I&apos;m here to help!</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(suggestion)}
                  className="text-xs hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex items-start gap-2 max-w-[85%]">
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-sm",
                    message.isUser
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  )}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.isUser ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Gemini AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask about video calls, messaging, or app features..."
              className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              disabled={isTyping}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
