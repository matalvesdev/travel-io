'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Wallet, Target, ArrowRight, Eye, EyeOff, Shield, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const login = useAuthStore((s) => s.login);

  const isValid = email.includes('@') && password.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.message || 'Falha no login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Dashboard mockup with motion */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-[340px]">
          <div className="phantom-card-elevated p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">T</span>
              </div>
              <span className="text-sm font-bold">TRAVEL.IO</span>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-3xl font-bold">R$ 15.045<span className="text-lg text-muted-foreground">,36</span></p>
              <p className="text-xs text-success mt-1">+R$ 567,41 (+3,9%)</p>
            </motion.div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: Wallet, label: 'Patrimônio', value: 'R$ 142K', color: 'bg-primary/10 text-primary' },
                { icon: TrendingUp, label: 'Investimentos', value: 'R$ 89K', color: 'bg-success/10 text-success' },
                { icon: Target, label: 'Metas', value: '3 ativas', color: 'bg-warning/10 text-warning' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                  className="phantom-card p-3 text-center">
                  <div className={`h-8 w-8 rounded-lg mx-auto flex items-center justify-center mb-2 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-6 h-24 flex items-end gap-1">
              {[35, 55, 40, 70, 45, 65, 80, 55, 70, 85, 60, 90].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  transition={{ delay: 0.7 + i * 0.03, duration: 0.4, ease: 'easeOut' }}
                  className="flex-1 rounded-t bg-primary/30" />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full max-w-md">
          <motion.div variants={fadeUp}>
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <span className="text-xl font-bold tracking-tight">TRAVEL.IO</span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-1">Entre na sua conta para continuar</p>
          </motion.div>

          {/* Social logins */}
          <motion.div variants={fadeUp} className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.05z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85 2.22c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85 2.22c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: `${window.location.origin}/auth/callback` } })}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.04 2.29.74 3.08.78 1.18-.24 2.31-.93 3.57-.84 1.55.12 2.93.74 3.8 1.84-3.37 2.04-2.59 5.83.39 7.16-.89 2.27-2.26 4.08-3.98 5.18zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.21-1.6 4.25-3.74 4.25z"/></svg>
              Apple
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou continue com email</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-6 space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive overflow-hidden">{error}</motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="mt-1" />
              {email.length > 0 && !email.includes('@') && <p className="text-xs text-destructive mt-1">Email inválido</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Senha</label>
                <Link href="/auth/forgot" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative mt-1">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary-gradient h-11" disabled={loading || !isValid}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>
              ) : (
                <>Entrar<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" /> Seguro
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3" /> Rápido
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3" /> LGPD
              </div>
            </div>
          </motion.form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">Criar conta</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
