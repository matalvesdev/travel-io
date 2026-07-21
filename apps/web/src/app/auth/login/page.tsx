'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, TrendingUp, Wallet, Target, ArrowRight, Eye, EyeOff, Shield, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

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

  const isValid = email.includes('@') && password.length >= 8;

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
          <motion.div variants={fadeUp} className="mt-6">
            <OAuthButtons mode="login" />
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
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pr-10" minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && <p className="text-xs text-destructive mt-1">Mínimo de 8 caracteres</p>}
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
