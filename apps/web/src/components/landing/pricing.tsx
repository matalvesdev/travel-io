'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  { name: 'Free', price: 'R$ 0', period: 'para sempre', description: 'Comece a organizar suas finanças.', features: ['Dashboard básico', 'Transações ilimitadas', '3 categorias', '1 conta', 'Metas básicas'], cta: 'Começar grátis', popular: false },
  { name: 'Pro', price: 'R$ 29', period: '/mês', description: 'Funcionalidades completas.', features: ['IA financeira', 'Categorias ilimitadas', 'Contas ilimitadas', 'Investimentos', 'Viagens & Milhas', 'Shopping alertas', 'Relatórios'], cta: 'Começar Trial', popular: true },
  { name: 'Premium', price: 'R$ 79', period: '/mês', description: 'Máximo contexto e controle.', features: ['IA contexto completo', 'Previsões', 'Rebalanceamento', 'Multi-moedas', 'API access', 'Onboarding', 'Suporte 24/7'], cta: 'Falar com vendas', popular: false },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-black tracking-tight sm:text-5xl uppercase">
            PLANOS <span className="gradient-text">TRANSPARENTES</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="mt-6 text-base text-muted-foreground">
            Escolha o plano ideal para você. Sem surpresas.
          </motion.p>
        </div>
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col p-8 card-hover ${plan.popular ? 'phantom-card-elevated ring-2 ring-primary/50' : 'phantom-card'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="btn-primary-gradient px-4 py-1 text-xs font-bold rounded-full">Mais popular</span></div>}
              <h3 className="text-lg font-bold uppercase">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-x-3">
                    <Check className="h-4 w-4 mt-0.5 text-success flex-none" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? 'default' : 'outline'} className={`mt-8 w-full ${plan.popular ? 'btn-primary-gradient' : ''}`}>
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
