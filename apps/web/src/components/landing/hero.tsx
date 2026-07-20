'use client';

import * as React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, Target, CreditCard, Wallet, Bell, MessageSquare, Check, ChevronRight, LayoutDashboard, Wallet as WalletIcon, TrendingUp as InvIcon, Plane, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistModal } from '@/components/landing/waitlist-modal';

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const slideRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => {
      const dur = 1200, start = performance.now();
      const anim = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return <>{display.toLocaleString('pt-BR')}</>;
}

function AnimatedProgress({ value, delay = 0 }: { value: number; delay?: number }) {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-1 rounded-full bg-primary" />;
}

export function Hero() {
  const [isWaitlistOpen, setIsWaitlistOpen] = React.useState(false);
  const [activeSidebar, setActiveSidebar] = React.useState('Dashboard');
  const [hoveredStat, setHoveredStat] = React.useState<number | null>(null);
  const [chartTooltip, setChartTooltip] = React.useState<{ x: number; y: number; val: string } | null>(null);
  const [chartPeriod, setChartPeriod] = React.useState('12M');
  const [checkedTx, setCheckedTx] = React.useState<number | null>(null);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const laptopY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const laptopRotate = useTransform(scrollYProgress, [0, 1], [0, -2]);

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Finanças', icon: WalletIcon },
    { name: 'Investimentos', icon: InvIcon },
    { name: 'Viagens', icon: Plane },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Objetivos', icon: Target },
  ];

  const chartPts = [[0,35],[18,25],[36,30],[54,15],[72,22],[90,12],[108,8],[126,18],[144,10],[162,5],[180,12],[200,3]];
  const chartVals = ['R$ 8.2K','R$ 9.1K','R$ 7.8K','R$ 11.2K','R$ 9.5K','R$ 12.4K','R$ 13.1K','R$ 10.8K','R$ 12.9K','R$ 14.2K','R$ 11.8K','R$ 15.0K'];

  const transactions = [
    { name: 'Supermercado', amount: '-R$ 245,90', type: 'expense', icon: '🛒', date: 'Hoje' },
    { name: 'Salário Ludens', amount: '+R$ 9.489', type: 'income', icon: '💰', date: 'Ontem' },
    { name: 'Investimento', amount: '+R$ 500', type: 'income', icon: '📈', date: '2 dias' },
    { name: 'Netflix', amount: '-R$ 39,90', type: 'expense', icon: '🎬', date: '3 dias' },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp}>
              <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl uppercase leading-[0.95]">
                SUA VIDA <span className="gradient-text">FINANCEIRA</span> INTELIGENTE
              </h1>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-lg leading-8 text-muted-foreground max-w-lg">
              Finanças, Investimentos, Viagens, Milhas e Shopping em um único ecossistema conectado.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Button size="lg" className="btn-primary-gradient px-8 py-3 text-base" onClick={() => setIsWaitlistOpen(true)}>
                Comece sua jornada <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-12 grid grid-cols-3 gap-4">
              {[
                { name: 'IBOV', change: '+1.23%', up: true, value: 'R$ 127K', pts: [40,55,45,65,50,70,60,75,68,80] },
                { name: 'S&P500', change: '+0.87%', up: true, value: 'R$ 89K', pts: [30,45,35,50,40,55,48,60,52,65] },
                { name: 'BTC', change: '+3.41%', up: true, value: 'R$ 45K', pts: [25,40,30,55,35,65,50,70,60,85] },
              ].map((s) => (
                <motion.div key={s.name} variants={fadeUp} whileHover={{ y: -2 }} className="phantom-card p-5 cursor-default">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className={`text-xs font-medium ${s.up ? 'text-success' : 'text-destructive'}`}>{s.change}</span>
                  </div>
                  <div className="h-10 mb-3">
                    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                      <defs><linearGradient id={`g-${s.name}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.up?'#22c55e':'#ef4444'} stopOpacity="0.3"/><stop offset="100%" stopColor={s.up?'#22c55e':'#ef4444'} stopOpacity="0"/></linearGradient></defs>
                      <path d={`M0,${30-s.pts[0]*.3} ${s.pts.map((p,i)=>`L${i*(100/(s.pts.length-1))},${30-p*.3}`).join(' ')} L100,30 L0,30 Z`} fill={`url(#g-${s.name})`}/>
                      <polyline points={s.pts.map((p,i)=>`${i*(100/(s.pts.length-1))},${30-p*.3}`).join(' ')} fill="none" stroke={s.up?'#22c55e':'#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — MacBook */}
          <motion.div style={{ y: laptopY, rotate: laptopRotate }} variants={slideRight} initial="hidden" animate="visible" className="relative flex justify-center">
            <div className="relative group">
              <div className="relative w-[600px] rounded-t-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl shadow-black/50 overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="h-6 bg-zinc-800 flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-zinc-600"/></div>
                <div className="bg-zinc-950" style={{ aspectRatio: '16/9' }}>
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
                    <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-zinc-600"/><div className="h-2.5 w-2.5 rounded-full bg-zinc-600"/><div className="h-2.5 w-2.5 rounded-full bg-zinc-600"/></div>
                    <div className="flex-1 mx-3 h-5 rounded bg-zinc-800/50 flex items-center px-3"><span className="text-[10px] text-zinc-500">app.travel.io/{activeSidebar.toLowerCase()}</span></div>
                    {/* Notification badge */}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                      <Bell className="h-3.5 w-3.5 text-zinc-500"/>
                      <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">3</span>
                      </div>
                    </motion.div>
                  </div>
                  <div className="p-5 flex gap-5 h-full">
                    {/* Sidebar */}
                    <div className="w-36 flex-shrink-0 space-y-1.5">
                      {sidebarItems.map((item) => (
                        <motion.div key={item.name} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveSidebar(item.name)}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] cursor-pointer transition-all duration-200 ${activeSidebar === item.name ? 'bg-primary/15 text-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                          <item.icon className={`h-3 w-3 ${activeSidebar === item.name ? 'text-primary' : ''}`}/>
                          <span>{item.name}</span>
                        </motion.div>
                      ))}
                    </div>
                    {/* Main */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <AnimatePresence mode="wait">
                          <motion.div key={activeSidebar} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                            <p className="text-[10px] text-zinc-500 mb-0.5">{activeSidebar === 'Dashboard' ? 'Patrimônio Total' : activeSidebar}</p>
                            <p className="text-xl font-bold">R$ <AnimatedNumber value={activeSidebar === 'Dashboard' ? 15045 : activeSidebar === 'Investimentos' ? 89300 : 5100} delay={200}/><span className="text-xs text-zinc-500">,36</span></p>
                            <p className="text-[10px] text-success">+R$ 567,41 (+3,9%)</p>
                          </motion.div>
                        </AnimatePresence>
                        <div className="flex gap-1.5">
                          {[Bell, MessageSquare].map((Icon, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors relative">
                              <Icon className="h-3.5 w-3.5 text-zinc-500"/>
                              {i === 0 && <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive"/>}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { icon: Wallet, label: 'Patrimônio', value: 'R$ 142K', color: 'bg-primary/15 text-primary', detail: 'Conta + Investimentos' },
                          { icon: TrendingUp, label: 'Receitas', value: 'R$ 8.2K', color: 'bg-success/15 text-success', detail: '+12% vs mês anterior' },
                          { icon: CreditCard, label: 'Despesas', value: 'R$ 5.1K', color: 'bg-destructive/15 text-destructive', detail: '-8% vs mês anterior' },
                          { icon: Target, label: 'Metas', value: '3 ativas', color: 'bg-warning/15 text-warning', detail: '67% concluídas' },
                        ].map((s, i) => (
                          <motion.div key={s.label} onHoverStart={() => setHoveredStat(i)} onHoverEnd={() => setHoveredStat(null)}
                            whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className={`phantom-card p-2.5 cursor-pointer transition-all relative ${hoveredStat === i ? 'ring-1 ring-primary/30' : ''}`}>
                            <div className={`h-6 w-6 rounded-md flex items-center justify-center mb-1.5 ${s.color}`}><s.icon className="h-3 w-3"/></div>
                            <p className="text-[8px] text-zinc-500">{s.label}</p>
                            <p className="text-[11px] font-bold">{s.value}</p>
                            {/* Tooltip on hover */}
                            <AnimatePresence>
                              {hoveredStat === i && (
                                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[8px] text-zinc-300 px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                                  {s.detail}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                      {/* Chart + Categories */}
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-3 phantom-card p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-medium">Fluxo Mensal</span>
                            <div className="flex gap-1">
                              {['1M','3M','6M','12M'].map(p => (
                                <motion.button key={p} whileTap={{ scale: 0.9 }}
                                  onClick={() => setChartPeriod(p)}
                                  className={`px-1.5 py-0.5 text-[7px] rounded transition-colors ${chartPeriod === p ? 'bg-primary/20 text-primary' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                  {p}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                          <div className="h-16 relative" onMouseLeave={() => setChartTooltip(null)}>
                            {/* Crosshair on hover */}
                            {chartTooltip && (
                              <div className="absolute top-0 bottom-0 w-px bg-zinc-700 pointer-events-none z-10"
                                style={{ left: `${(chartTooltip.x / 200) * 100}%` }}/>
                            )}
                            <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
                              <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/></linearGradient></defs>
                              <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 1.3, duration: 1.2 }} d="M0,35 L18,25 L36,30 L54,15 L72,22 L90,12 L108,8 L126,18 L144,10 L162,5 L180,12 L200,3 L200,50 L0,50 Z" fill="url(#lg)"/>
                              <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.3, duration: 1.2 }} d="M0,35 L18,25 L36,30 L54,15 L72,22 L90,12 L108,8 L126,18 L144,10 L162,5 L180,12 L200,3" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              {chartPts.map(([x,y], i) => (
                                <motion.circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--primary))" className="cursor-pointer" style={{ pointerEvents: 'all' }}
                                  onMouseEnter={() => setChartTooltip({ x, y, val: chartVals[i] })}
                                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 + i * 0.05 }}/>
                              ))}
                            </svg>
                            <AnimatePresence>
                              {chartTooltip && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  className="absolute bg-zinc-800 text-[9px] text-white px-2 py-1 rounded shadow-lg pointer-events-none z-10"
                                  style={{ left: `${(chartTooltip.x / 200) * 100}%`, top: `${(chartTooltip.y / 50) * 100 - 30}%` }}>
                                  {chartTooltip.val}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div className="col-span-2 phantom-card p-3">
                          <span className="text-[9px] font-medium">Categorias</span>
                          <div className="mt-2 space-y-2">
                            {[{ name: 'Alimentação', pct: 35, color: 'bg-primary' }, { name: 'Transporte', pct: 25, color: 'bg-success' }, { name: 'Lazer', pct: 20, color: 'bg-warning' }, { name: 'Outros', pct: 20, color: 'bg-info' }].map((c, i) => (
                              <motion.div key={c.name} whileHover={{ x: 2 }} className="space-y-0.5 cursor-pointer">
                                <div className="flex justify-between text-[8px]"><span className="text-zinc-500">{c.name}</span><span>{c.pct}%</span></div>
                                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                                  <AnimatedProgress value={c.pct} delay={1500 + i * 200} />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Transactions */}
                      <div className="space-y-1">
                        {transactions.map((t, i) => (
                          <motion.div key={t.name} whileHover={{ x: 3 }}
                            initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 + i * 0.06 }}
                            onClick={() => setCheckedTx(checkedTx === i ? null : i)}
                            className="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-zinc-800/50 group">
                            <div className="flex items-center gap-2">
                              <motion.div animate={{ scale: checkedTx === i ? 1.2 : 1 }}
                                className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] transition-colors ${checkedTx === i ? 'bg-primary text-white' : 'bg-zinc-800'}`}>
                                {checkedTx === i ? <Check className="h-3 w-3" /> : t.icon}
                              </motion.div>
                              <div>
                                <span className="text-[10px] font-medium">{t.name}</span>
                                <span className="text-[8px] text-zinc-600 ml-1.5">{t.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-semibold ${t.type === 'income' ? 'text-success' : 'text-zinc-400'}`}>{t.amount}</span>
                              <ChevronRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-3 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-b-2xl border-x border-b border-zinc-600/50"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 rounded-b bg-zinc-600"/></div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[90%] h-3 bg-black/20 blur-xl rounded-full"/>
            </div>
          </motion.div>
        </div>
      </div>
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </section>
  );
}
