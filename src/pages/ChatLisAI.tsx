import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import { ArrowLeft, Send, Bot, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatLisAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [trainingData, setTrainingData] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega configurações do localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    const savedTrainingData = localStorage.getItem("lis_training_data");
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedTrainingData) setTrainingData(savedTrainingData);

    // Mensagem inicial da Lis
    const initialMessage: Message = {
      id: "initial",
      type: "assistant",
      content: "Olá! Eu sou a Lis, sua assistente virtual. Como posso ajudá-lo hoje?",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  // Auto scroll para última mensagem e foco no input
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        // Tenta múltiplos seletores para o viewport do ScrollArea
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
                               scrollAreaRef.current.querySelector('.scroll-area-viewport') ||
                               scrollAreaRef.current.firstElementChild;
        
        if (scrollContainer) {
          const doScroll = () => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          };
          
          // Usa requestAnimationFrame para garantir que o DOM seja atualizado
          requestAnimationFrame(() => {
            doScroll();
            
            // Scrolls com delays para garantir
            setTimeout(doScroll, 100);
            setTimeout(doScroll, 300);
            setTimeout(doScroll, 600);
            
            // Foca no input após o scroll (só se não estiver carregando)
            if (!isLoading && inputRef.current) {
              setTimeout(() => {
                inputRef.current?.focus();
              }, 700);
            }
          });
        }
      }
    };

    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!apiKey) {
      toast.error("Configure sua API key da OpenAI nas configurações");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const systemPrompt = trainingData 
        ? `Você é a Lis, uma assistente virtual. Use as seguintes informações como base de conhecimento: ${trainingData}`
        : "Você é a Lis, uma assistente virtual prestativa e amigável.";

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Usando gpt-4o pois gpt-5 ainda não está disponível
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: userMessage.content }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Erro ao comunicar com a IA. Verifique sua API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Headers fixos */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background">
        <Header />
        
        {/* Breadcrumb Header */}
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
                <div className="text-muted-foreground">/</div>
                <h1 className="text-xl font-semibold text-foreground">Chat com Lis AI</h1>
              </div>
              <Link to="/configuracao">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurar
                </Button>
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* Chat Container - com margin-top para compensar o header fixo */}
      <div className="pt-40 pb-8 h-screen flex flex-col">
        <div className="flex-1 container mx-auto px-6 flex flex-col max-w-4xl">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6 mt-4">
            <div ref={scrollAreaRef} className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-foreground p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem para a Lis..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}