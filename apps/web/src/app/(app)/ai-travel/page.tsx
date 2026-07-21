'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingDown, TrendingUp, Calendar, Plane, Target,
  Lightbulb, BarChart3, Loader2, Check, X, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useAiTravelResponse } from '@/hooks/api/use-ai-travel';
import type { SeasonalData, SavingsPlan } from '@/lib/api/ai-travel';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_DESTINATIONS = ['Paris', 'Tóquio', 'Lisboa', 'Bali', 'Cancún', 'Budapeste', 'Cusco'];

export default function AiTravelPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [result, setResult] = React.useState<{
    seasonal: SeasonalData;
    savingsPlans: SavingsPlan[];
    estimatedCost: number;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const analyzeMutation = useAiTravelResponse();

  const showToast = (m: string, t: 'success' | 'error' = 'success') => {
    setToast({ message: m, type: t });
    setTimeout(() => setToast(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => { scrollToBottom(); }, [messages]);

  const handleAnalyze = async (destination: string) => {
    if (!destination.trim()) return;
    const dest = destination.trim();

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: dest, timestamp: new Date() },
    ]);
    setInput('');
    setError(null);
    setResult(null);

    try {
      const res = await analyzeMutation.mutateAsync({ destination: dest });
      setResult(res);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Análise de ${dest} concluída! Confira os dados acima.`,
          timestamp: new Date(),
        },
      ]);
      showToast('Análise concluída!');
    } catch {
      setError('Erro ao analisar destino. Tente novamente.');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Desculpe, houve um erro ao analisar o destino.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" /> IA Travel
        </h1>
        <p className="text-muted-foreground">Análise inteligente para planejar sua viagem com o melhor custo-benefício</p>
      </div>

      {/* Chat interface */}
      <div className="phantom-card overflow-hidden">
        <div className="flex h-[400px] flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground font-medium">Qual destino você quer analisar?</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Digite o nome ou clique em uma sugestão</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
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
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); handleAnalyze(input); }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: Paris, Tóquio, Bali, Cancún..."
                disabled={analyzeMutation.isPending}
                className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm"
              />
              <Button type="submit" disabled={!input.trim() || analyzeMutation.isPending}>
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {QUICK_DESTINATIONS.map((city) => (
            <button
              key={city}
              onClick={() => handleAnalyze(city)}
              className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80 transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {analyzeMutation.isPending && (
        <div className="phantom-card p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Analisando...</p>
          <p className="text-sm text-muted-foreground mt-1">Verificando preços históricos, sazonalidade e dicas</p>
        </div>
      )}

      {/* Error */}
      {error && !analyzeMutation.isPending && (
        <div className="phantom-card p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => { setError(null); }}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Results */}
      {result && !analyzeMutation.isPending && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" /> Melhor Época para Comprar
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Melhor época</span>
                </div>
                <p className="text-lg font-bold">{result.seasonal.best}</p>
                <p className="text-xs text-muted-foreground mt-1">Economia média de {result.seasonal.avgDiscount}%</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Época mais cara</span>
                </div>
                <p className="text-lg font-bold">{result.seasonal.worst}</p>
                <p className="text-xs text-muted-foreground mt-1">Preços acima da média</p>
              </div>
            </div>
          </div>

          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-green-500" /> Plano de Economia
            </h3>
            <div className="space-y-3">
              {result.savingsPlans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20"
                >
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-600">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{plan.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.strategy}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Prazo: {plan.timeline}</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 whitespace-nowrap">-{formatCurrency(plan.savings)}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-amber-500" /> Dicas
            </h3>
            <div className="space-y-2">
              {result.seasonal.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-blue-500" /> Comparação de Preços
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-4 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground mb-1">Baixa temporada</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(result.estimatedCost * 0.7)}</p>
                <p className="text-xs text-muted-foreground">-{result.seasonal.avgDiscount}% vs média</p>
              </div>
              <div className="p-4 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground mb-1">Média</p>
                <p className="text-2xl font-bold">{formatCurrency(result.estimatedCost)}</p>
                <p className="text-xs text-muted-foreground">Estimativa para 2 pessoas</p>
              </div>
              <div className="p-4 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground mb-1">Alta temporada</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(result.estimatedCost * 1.3)}</p>
                <p className="text-xs text-muted-foreground">+30% vs média</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
