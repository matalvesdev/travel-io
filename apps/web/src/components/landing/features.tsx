'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Plane, ShoppingBag, Target, Bell, Shield, BarChart3 } from 'lucide-react';

const features = [
  { name: 'Money', description: 'Controle financeiro completo. Fluxo de caixa, orçamento, reserva de emergência e patrimônio.', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
  { name: 'Investments', description: 'Carteira completa com ações, FIIs, ETFs, criptomoedas e renda fixa.', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
  { name: 'Travel', description: 'Pesquisa de passagens e hotéis com histórico de preços e alertas.', icon: Plane, color: 'text-info', bg: 'bg-info/10' },
  { name: 'Loyalty', description: 'Gerenciamento de milhas, transferências bonificadas e melhor resgate.', icon: ShoppingBag, color: 'text-warning', bg: 'bg-warning/10' },
  { name: 'Shopping', description: 'Wishlist com monitoramento de preços, comparação e cashback.', icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
  { name: 'Goals', description: 'Todos os módulos convergem para seus objetivos de vida.', icon: Target, color: 'text-success', bg: 'bg-success/10' },
  { name: 'Alertas', description: 'Notificações inteligentes baseadas no contexto financeiro.', icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
  { name: 'Segurança', description: 'Criptografia 256-bit, MFA, passkeys e compliance com LGPD.', icon: Shield, color: 'text-info', bg: 'bg-info/10' },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 lg:mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-black tracking-tight sm:text-5xl uppercase">
            TUDO CONECTADO{' '}
            <span className="gradient-text">PELOS SEUS OBJETIVOS</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="mt-6 text-base text-muted-foreground">
            Cada módulo trabalha junto para ajudar você a tomar melhores decisões financeiras.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div key={feature.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="phantom-card p-6 card-hover">
              <div className={`h-11 w-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-2">{feature.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
