'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Plane, ShoppingBag, ArrowRight, Brain, Check, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

function PasswordStrength({ password }: { password: string }) {
  const strength = React.useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  if (!password) return null;

  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const colors = ['', 'bg-destructive', 'bg-warning', 'bg-info', 'bg-success'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? colors[strength] : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">{labels[strength]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const login = useAuthStore((s) => s.login);

  const isValid = name.length >= 2 && email.includes('@') && password.length >= 8 && acceptTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Auto-login after registration
      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 items-center justify-center overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-md px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl font-black uppercase leading-tight">
            COMECE A ALCANÇAR{' '}
            <span className="gradient-text">SEUS OBJETIVOS</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-4 text-muted-foreground">
            Junte-se a milhares de pessoas que já estão usando o Travel.io para tomar melhores decisões financeiras.
          </motion.p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { icon: TrendingUp, label: 'Investimentos', color: 'bg-success/10 text-success' },
              { icon: Plane, label: 'Viagens', color: 'bg-info/10 text-info' },
              { icon: ShoppingBag, label: 'Shopping', color: 'bg-warning/10 text-warning' },
              { icon: Brain, label: 'IA Inteligente', color: 'bg-primary/10 text-primary' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="phantom-card p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Usuários', value: '10K+' },
              { label: 'Transações', value: '1M+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="phantom-card p-3 text-center">
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
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
            <h2 className="text-2xl font-bold">Crie sua conta</h2>
            <p className="text-muted-foreground mt-1">Comece a organizar suas finanças</p>
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
              <label className="text-sm font-medium">Nome completo</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você quer ser chamado" required className="mt-1" />
              {name.length > 0 && name.length < 2 && <p className="text-xs text-destructive mt-1">Nome deve ter pelo menos 2 caracteres</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="mt-1" />
              {email.length > 0 && !email.includes('@') && <p className="text-xs text-destructive mt-1">Email inválido</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Senha</label>
              <div className="relative mt-1">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setAcceptTerms(!acceptTerms)}
                className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${acceptTerms ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'}`}>
                {acceptTerms && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Eu concordo com os{' '}
                <Link href="/terms" className="text-primary hover:underline">Termos de Uso</Link>{' '}
                e{' '}
                <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
              </p>
            </div>

            <Button type="submit" className="w-full btn-primary-gradient h-11" disabled={loading || !isValid}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando conta...</>
              ) : (
                <>Criar conta<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" /> LGPD
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Zap className="h-3 w-3" /> 256-bit
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3" /> Gratuito
              </div>
            </div>
          </motion.form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">Entrar</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
