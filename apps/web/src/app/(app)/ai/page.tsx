'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Wallet, Plane, TrendingUp, ShoppingBag, BarChart3, Sparkles, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSendMessage, useConversations, useMessages, useCreateConversation } from '@/hooks/api/use-ai';
import type { Message } from '@/lib/api/ai';

const suggestions = [
  { icon: Wallet, text: 'Como estão minhas finanças?', color: 'text-success' },
  { icon: Plane, text: 'Posso viajar para Europa?', color: 'text-primary' },
  { icon: TrendingUp, text: 'Como rebalancear minha carteira?', color: 'text-info' },
  { icon: ShoppingBag, text: 'Vale comprar esse notebook?', color: 'text-warning' },
  { icon: BarChart3, text: 'Quanto preciso investir por mês?', color: 'text-purple-500' },
];

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiPage() {
  const [activeConversationId, setActiveConversationId] = React.useState<string>('');
  const [localMessages, setLocalMessages] = React.useState<LocalMessage[]>([]);
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { data: conversationsData } = useConversations();
  const { data: messagesData } = useMessages(activeConversationId);
  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();

  const conversations = conversationsData?.conversations ?? [];
  const serverMessages: Message[] = messagesData?.messages ?? [];

  const displayMessages: LocalMessage[] = [
    ...serverMessages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(m.createdAt),
    })),
    ...localMessages,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => { scrollToBottom(); }, [displayMessages]);

  const handleSend = async () => {
    if (!input.trim() || sendMessage.isPending) return;
    const text = input.trim();
    setInput('');

    const userMsg: LocalMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);

    let convId = activeConversationId;
    if (!convId) {
      try {
        const res = await createConversation.mutateAsync();
        convId = res.data?.conversationId ?? '';
        setActiveConversationId(convId);
      } catch {
        setLocalMessages((prev) => [
          ...prev,
          { id: `local-${Date.now() + 1}`, role: 'assistant', content: 'Erro ao criar conversa.', timestamp: new Date() },
        ]);
        return;
      }
    }

    try {
      const res = await sendMessage.mutateAsync({ message: text, conversationId: convId });
      setLocalMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now() + 2}`,
          role: 'assistant',
          content: res.data?.response || 'Erro ao processar.',
          timestamp: new Date(),
        },
      ]);
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        { id: `local-${Date.now() + 2}`, role: 'assistant', content: 'Erro de conexão. Tente novamente.', timestamp: new Date() },
      ]);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId('');
    setLocalMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setLocalMessages([]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 phantom-card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Conversas</h2>
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.length === 0 && localMessages.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              Nenhuma conversa ainda
            </div>
          ) : (
            <>
              {activeConversationId === '' && localMessages.length > 0 && (
                <div className="px-3 py-2 rounded-lg bg-primary/10 text-sm font-medium truncate">
                  Nova conversa
                </div>
              )}
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                    activeConversationId === conv.id
                      ? 'bg-primary/10 font-medium'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate">{conv.title || 'Conversa'}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Assistente IA
            </h1>
            <p className="text-muted-foreground">Converse sobre finanças, investimentos e viagens</p>
          </div>
        </div>

        <div className="phantom-card flex-1 overflow-hidden">
          <div className="flex h-full flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-12 w-12 text-muted-foreground/20 mb-3" />
                  <p className="text-muted-foreground font-medium">Olá! Como posso te ajudar?</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Escolha uma sugestão ou digite sua pergunta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {displayMessages.map((m) => (
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
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                          <p
                            className={`mt-1 text-xs ${
                              m.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}
                          >
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

                  {sendMessage.isPending && (
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
              )}
            </div>

            {/* Suggestions */}
            {displayMessages.length === 0 && (
              <div className="border-t p-4">
                <p className="mb-3 text-sm text-muted-foreground">Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s.text}
                      variant="outline"
                      size="sm"
                      onClick={() => { setInput(s.text); }}
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
                  disabled={sendMessage.isPending}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || sendMessage.isPending}>
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
