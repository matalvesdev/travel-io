'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Wallet, Plane, TrendingUp, ShoppingBag, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiApi } from '@/lib/api';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

const suggestions = [
  { icon: Wallet, text: 'Como estão minhas finanças?', color: 'text-success' },
  { icon: Plane, text: 'Posso viajar para Europa?', color: 'text-primary' },
  { icon: TrendingUp, text: 'Como rebalancear minha carteira?', color: 'text-info' },
  { icon: ShoppingBag, text: 'Vale comprar esse notebook?', color: 'text-warning' },
  { icon: BarChart3, text: 'Quanto preciso investir por mês?', color: 'text-purple-500' },
];

export default function AIPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! 👋 Sou o assistente financeiro do Travel.io.\n\nPosso te ajudar com:\n• 💰 Finanças pessoais\n• 📈 Investimentos\n• ✈️ Viagens e milhas\n• 🛍️ Shopping inteligente\n\nComo posso te ajudar hoje?', timestamp: new Date() },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiApi.sendMessage({ message: input, conversationId: '' });
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: res.data?.response || 'Erro ao processar.', timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Erro de conexão. Tente novamente.', timestamp: new Date() }]);
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Assistente IA
          </h1>
          <p className="text-muted-foreground">Converse sobre finanças, investimentos e viagens</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="phantom-card flex-1 overflow-hidden">
        <div className="flex h-full flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                      <p className={`mt-1 text-xs ${
                        m.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {m.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {m.role === 'user' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="border-t p-4">
              <p className="mb-3 text-sm text-muted-foreground">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Button
                    key={s.text}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(s.text)}
                    className="h-auto py-2"
                  >
                    <s.icon className={`mr-2 h-4 w-4 ${s.color}`} />
                    {s.text}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
