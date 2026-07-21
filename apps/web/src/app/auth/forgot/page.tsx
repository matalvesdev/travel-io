'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const isValid = email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={fadeUp}>
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </motion.div>

        {sent ? (
          <motion.div variants={fadeUp}>
            <div className="rounded-xl bg-success/10 p-4 mb-6 flex items-center gap-3">
              <div className="rounded-full bg-success/20 p-2">
                <Check className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">Email enviado!</p>
                <p className="text-xs text-muted-foreground">Verifique sua caixa de entrada</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Enviamos um link de redefinição de senha para <span className="font-medium text-foreground">{email}</span>.
              Clique no link para criar uma nova senha.
            </p>
            <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(''); }}>
              Enviar novamente
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold">Esqueceu a senha?</h2>
              <p className="text-muted-foreground mt-1">Digite seu email para redefinir sua senha</p>
            </motion.div>

            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}

              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !isValid}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                ) : (
                  'Enviar link de redefinição'
                )}
              </Button>
            </motion.form>
          </>
        )}
      </motion.div>
    </div>
  );
}
