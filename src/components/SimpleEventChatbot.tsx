import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User, Calendar, MapPin, Ticket, Sparkles } from "lucide-react";
import { generateAIResponse } from "@/lib/gemini";
import { searchEvents, Event } from "@/lib/supabase";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  events?: Event[];
  isAIGenerated?: boolean;
}

export function SimpleEventChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm EventAI! 🎭 How can I help you find the perfect event today?",
      sender: 'bot',
      timestamp: new Date(),
      isAIGenerated: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUsingRealAI, setIsUsingRealAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get AI response from Gemini API
      const aiResponse = await generateAIResponse(inputValue);
      
      // Better logic to detect if we're using real AI
      // Check if response is one of our fallback responses
      const fallbackResponses = [
        "I can help you find events! What are you looking for? 🎪",
        "I'd be happy to help! Could you be more specific about what kind of events you're looking for? 🎪"
      ];
      
      const isRealAI = !fallbackResponses.some(fallback => aiResponse.includes(fallback));
      setIsUsingRealAI(isRealAI);
      
      // Search for events in database
      const events = await searchEvents(inputValue);
      
      // Create bot message with AI response and events
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        events: events,
        isAIGenerated: isRealAI
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again! 😅",
        sender: 'bot',
        timestamp: new Date(),
        isAIGenerated: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLowestPrice = (price: any) => {
    if (!price) return 'N/A';
    const prices = Object.values(price).map(p => parseInt(p as string));
    return Math.min(...prices);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50 shadow-xl"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4">
          <Card className="w-full max-w-md h-[600px] flex flex-col bg-background shadow-2xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-semibold text-lg">EventAI</span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {isUsingRealAI ? (
                      <>
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        <span>Powered by Gemini AI</span>
                      </>
                    ) : (
                      <>
                        <span>Using Smart Fallback</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 hover:bg-primary/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.isAIGenerated && (
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    
                    {/* Display Events if available */}
                    {message.events && message.events.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          Found {message.events.length} events:
                        </div>
                        {message.events.map((event) => (
                          <div key={event.id} className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <div className="font-medium text-sm mb-1">{event.title}</div>
                            <div className="text-xs text-muted-foreground mb-2">{event.description}</div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatEventDate(event.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Ticket className="h-3 w-3" />
                                <span>From ${getLowestPrice(event.price)}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                                {event.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs opacity-70">
                        {isUsingRealAI ? "Gemini AI is thinking..." : "EventAI is thinking..."}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t bg-background/50">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what event you're looking for..."
                  className="flex-1 border-border/50 focus:border-primary"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Try: "cultural festivals", "concerts", "sports events"
              </div>
              {isUsingRealAI && (
                <div className="text-xs text-yellow-600 mt-1 text-center flex items-center justify-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Real AI responses enabled!</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
