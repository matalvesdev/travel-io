'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { question: 'O Travel.io é seguro?', answer: 'Sim. Criptografia de ponta a ponta, MFA, passkeys e compliance total com LGPD.' },
  { question: 'Preciso pagar?', answer: 'Não. Plano gratuito com funcionalidades essenciais. Planos pagos desbloqueiam recursos avançados.' },
  { question: 'Como funciona a IA?', answer: 'Analisa patrimônio, renda, despesas, investimentos e objetivos para gerar recomendações personalizadas.' },
  { question: 'Conecta com bancos?', answer: 'Sim. Você pode importar seus dados via planilhas CSV ou conectar suas contas de forma segura.' },
  { question: 'Suporta investimentos?', answer: 'Sim. Ações, FIIs, ETFs, criptomoedas e renda fixa. Acompanhe rentabilidade e rebalanceamento.' },
  { question: 'Funciona no celular?', answer: 'Sim. PWA que funciona como app nativo com notificações push.' },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl font-black tracking-tight sm:text-5xl uppercase">
            PERGUNTAS <span className="gradient-text">FREQUENTES</span>
          </motion.h2>
        </div>
        <div className="mx-auto max-w-2xl space-y-3">
          {faqs.map((faq, index) => (
            <motion.div key={faq.question} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full text-left phantom-card p-4 hover:bg-muted/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold pr-4">{faq.question}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 flex-none">
                    {openIndex === index ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
