'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Loader2, Copy, CheckCircle2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const waitlistSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().optional(),
  interest: z.enum(['FINANCE', 'TRAVEL', 'INVESTMENT', 'SHOPPING', 'ALL'], {
    required_error: 'Selecione seu interesse principal',
  }),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [referralCode, setReferralCode] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const interest = watch('interest');

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setReferralCode(result.data?.referralCode || 'TRAVEL' + Math.random().toString(36).substring(2, 8).toUpperCase());
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Waitlist submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setReferralCode('');
      reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Junte-se à waitlist</DialogTitle>
              <DialogDescription>
                Seja um dos primeiros a usar o Travel.io e ganhe benefícios exclusivos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <Input
                  {...register('email')}
                  placeholder="seu@email.com"
                  type="email"
                  className="w-full"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register('name')}
                  placeholder="Seu nome (opcional)"
                  className="w-full"
                />
              </div>

              <div>
                <Select
                  value={interest}
                  onValueChange={(value) => setValue('interest', value as WaitlistFormData['interest'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seu interesse principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINANCE">Finanças Pessoais</SelectItem>
                    <SelectItem value="INVESTMENT">Investimentos</SelectItem>
                    <SelectItem value="TRAVEL">Viagens & Milhas</SelectItem>
                    <SelectItem value="SHOPPING">Shopping Inteligente</SelectItem>
                    <SelectItem value="ALL">Tudo!</SelectItem>
                  </SelectContent>
                </Select>
                {errors.interest && (
                  <p className="text-sm text-destructive mt-1">{errors.interest.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Entrar na waitlist'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao se inscrever, você concorda com nossos Termos de Uso e Política de Privacidade.
              </p>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <DialogTitle className="text-2xl text-center">Você está na lista!</DialogTitle>
              <DialogDescription className="text-center">
                Obrigado por se inscrever. Você receberá um email quando tivermos novidades.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-2">Seu código de indicação:</p>
                <div className="flex items-center justify-between">
                  <code className="font-mono text-lg font-semibold">{referralCode}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Indique amigos e suba na fila! Cada indicação move você para frente.
              </p>

              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
