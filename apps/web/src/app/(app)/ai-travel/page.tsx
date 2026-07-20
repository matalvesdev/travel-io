'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingDown, TrendingUp, Calendar, Plane, Target, Lightbulb, BarChart3, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { aiTravelApi, type SeasonalData, type SavingsPlan } from '@/lib/api/ai-travel';

export default function AiTravelPage() {
  const [destination, setDestination] = React.useState('');
  const [seasonal, setSeasonal] = React.useState<SeasonalData | null>(null);
  const [savingsPlans, setSavingsPlans] = React.useState<SavingsPlan[]>([]);
  const [estimatedCost, setEstimatedCost] = React.useState(0);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (m: string, t: 'success' | 'error' = 'success') => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000); };

  const handleAnalyze = async () => {
    if (!destination) { showToast('Digite um destino', 'error'); return; }
    setAnalyzing(true);
    setError(null);
    try {
      const [seasonRes, savingsRes] = await Promise.all([
        aiTravelApi.getSeasonalData(destination),
        aiTravelApi.getSavingsPlan(destination),
      ]);
      setSeasonal(seasonRes.data);
      setSavingsPlans(savingsRes.data.savingsPlans);
      setEstimatedCost(savingsRes.data.estimatedCost);
      showToast('Análise concluída!');
    } catch {
      setError('Erro ao analisar destino. Tente novamente.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'}`}>
            {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-8 w-8 text-primary" /> Assistente de Viagem IA</h1>
        <p className="text-muted-foreground">Análise inteligente para planejar sua viagem com o melhor custo-benefício</p>
      </div>

      {/* Input */}
      <div className="phantom-card p-6">
        <h3 className="text-lg font-semibold mb-3">Qual destino você quer analisar?</h3>
        <div className="flex gap-3">
          <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ex: Paris, Tóquio, Bali, Cancún..."
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm" onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
          <Button onClick={handleAnalyze} disabled={analyzing} className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Analisar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Paris', 'Tóquio', 'Lisboa', 'Bali', 'Cancún', 'Budapeste', 'Cusco'].map(city => (
            <button key={city} onClick={() => { setDestination(city); }}
              className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-muted/80 transition-colors">{city}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {analyzing && (
        <div className="phantom-card p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Analisando {destination}...</p>
          <p className="text-sm text-muted-foreground mt-1">Verificando preços históricos, sazonalidade e dicas</p>
        </div>
      )}

      {/* Error */}
      {error && !analyzing && (
        <div className="phantom-card p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-3" onClick={handleAnalyze}>Tentar novamente</Button>
        </div>
      )}

      {/* Results */}
      {seasonal && !analyzing && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Best time to buy */}
          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Calendar className="h-5 w-5 text-primary" /> Melhor Época para Comprar</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1"><TrendingDown className="h-4 w-4 text-green-600" /><span className="text-sm font-medium text-green-600">Melhor época</span></div>
                <p className="text-lg font-bold">{seasonal.best}</p>
                <p className="text-xs text-muted-foreground mt-1">Economia média de {seasonal.avgDiscount}%</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-red-600" /><span className="text-sm font-medium text-red-600">Época mais cara</span></div>
                <p className="text-lg font-bold">{seasonal.worst}</p>
                <p className="text-xs text-muted-foreground mt-1">Preços acima da média</p>
              </div>
            </div>
          </div>

          {/* Savings plan */}
          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Target className="h-5 w-5 text-green-500" /> Plano de Economia</h3>
            <div className="space-y-3">
              {savingsPlans.map((plan, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-green-600">{i + 1}</span></div>
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

          {/* Tips */}
          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><Lightbulb className="h-5 w-5 text-amber-500" /> Dicas para {destination}</h3>
            <div className="space-y-2">
              {seasonal.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price comparison */}
          <div className="phantom-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3"><BarChart3 className="h-5 w-5 text-blue-500" /> Comparação de Preços</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-4 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground mb-1">Baixa temporada</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(estimatedCost * 0.7)}</p>
                <p className="text-xs text-muted-foreground">-{seasonal.avgDiscount}% vs média</p>
              </div>
              <div className="p-4 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground mb-1">Média</p>
                <p className="text-2xl font-bold">{formatCurrency(estimatedCost)}</p>
                <p className="text-xs text-muted-foreground">Estimativa para 2 pessoas</p>
              </div>
              <div className="p-4 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground mb-1">Alta temporada</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(estimatedCost * 1.3)}</p>
                <p className="text-xs text-muted-foreground">+30% vs média</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <Button onClick={() => window.location.href = `/travel?destination=${destination}`}
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
            <Plane className="mr-2 h-5 w-5" /> Planejar Viagem para {destination}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
