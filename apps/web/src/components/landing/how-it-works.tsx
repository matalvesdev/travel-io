'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LinkIcon, Brain, Target } from 'lucide-react';

const steps = [
  { name: 'Defina seus objetivos', description: 'Diga o que você quer conquistar e o Travel.io trabalha para isso.', icon: Target, number: '01' },
  { name: 'Conecte tudo', description: 'Bancos, investimentos, milhas, cartões — tudo em um só lugar.', icon: LinkIcon, number: '02' },
  { name: 'Entenda seu contexto', description: 'O sistema analisa patrimônio, fluxo de caixa e comportamento financeiro.', icon: Brain, number: '03' },
  { name: 'Tome decisões melhores', description: 'Recomendações contextualizadas para cada momento da sua vida.', icon: UserPlus, number: '04' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-black tracking-tight sm:text-5xl uppercase">
            COMO <span className="gradient-text">FUNCIONA</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="mt-6 text-base text-muted-foreground">
            O Travel.io trabalha com você para alcançar seus objetivos de vida.
          </motion.p>
        </div>
        <div className="mx-auto max-w-4xl grid grid-cols-1 gap-6 sm:grid-cols-2">
          {steps.map((step, index) => (
            <motion.div key={step.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
              className="phantom-card p-8 relative overflow-hidden card-hover">
              <div className="absolute top-6 right-6 text-6xl font-black text-primary/[0.06]">{step.number}</div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wide mb-2">{step.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
