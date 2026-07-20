'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, TrendingUp, Plane, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistModal } from '@/components/landing/waitlist-modal';

export function CTA() {
  const [isWaitlistOpen, setIsWaitlistOpen] = React.useState(false);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="phantom-card-elevated overflow-hidden px-6 py-16 sm:px-16 md:px-24 relative">
          <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '24px 24px'}} />
          <div className="absolute top-8 left-8 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center animate-float"><Wallet className="h-5 w-5 text-primary" /></div>
          <div className="absolute top-12 right-12 h-10 w-10 rounded-full bg-success/10 flex items-center justify-center animate-float-delayed"><TrendingUp className="h-4 w-4 text-success" /></div>
          <div className="absolute bottom-8 left-16 h-8 w-8 rounded-full bg-info/10 flex items-center justify-center animate-float"><Target className="h-3.5 w-3.5 text-info" /></div>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl uppercase">COMECE A ALCANÇAR SEUS OBJETIVOS</h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Junte-se a milhares de pessoas que já estão usando o Travel.io para tomar melhores decisões financeiras.
            </p>
            <div className="mt-10">
              <Button size="lg" className="btn-primary-gradient px-8" onClick={() => setIsWaitlistOpen(true)}>
                Comece agora gratuitamente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Sem cartão de crédito. Cancele quando quiser.</p>
          </div>
        </motion.div>
      </div>
      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </section>
  );
}
