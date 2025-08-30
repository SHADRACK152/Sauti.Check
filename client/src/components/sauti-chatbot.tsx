import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SautiChatbot({ isOpen, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: "Hujambo! I'm Sauti, your AI civic assistant. I can help you with fact-checking, civic information, and navigating the platform. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        message: data.response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error: any) => {
      toast({
        title: "Chat error",
        description: "Failed to get response from Sauti. Please try again.",
        variant: "destructive",
      });
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message: "Sorry, I'm having trouble responding right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!auth.isAuthenticated()) {
      toast({
        title: "Login required",
        description: "Please login to chat with Sauti",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full hover:bg-accent/90 z-40 shadow-lg"
        data-testid="button-open-chatbot"
      >
        <i className="fas fa-comments text-xl"></i>
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden" 
        onClick={onToggle}
      />
      
      {/* Chatbot Window */}
      <Card className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-80 md:w-96 h-96 z-50 shadow-xl">
        <CardHeader className="bg-accent text-accent-foreground rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div>
                <CardTitle className="text-sm">Sauti Assistant</CardTitle>
                <p className="text-xs opacity-90">Your civic AI helper</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-accent-foreground hover:bg-accent-foreground/20 p-1"
              data-testid="button-close-chatbot"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-80">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  data-testid={`chat-message-${message.isBot ? 'bot' : 'user'}-${message.id}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.isBot
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="mb-1">{message.message}</p>
                    <p className="text-xs opacity-70">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about civic info, facts, or the platform..."
                className="flex-1"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="sm"
                disabled={chatMutation.isPending || !inputMessage.trim()}
                className="bg-accent hover:bg-accent/90"
                data-testid="button-send-message"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}