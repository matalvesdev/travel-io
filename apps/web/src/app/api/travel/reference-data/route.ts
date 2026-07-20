import { NextRequest } from 'next/server';

const milesPrograms = [
  { name: 'Smiles (GOL)', color: '#FF6600', icon: '✈️', partner: 'GOL' },
  { name: 'Latam Pass', color: '#1B0F4E', icon: '✈️', partner: 'LATAM' },
  { name: 'Livelo', color: '#E91E63', icon: '💳', partner: 'Multi' },
  { name: 'Esfera (Itaú)', color: '#EC7000', icon: '🏦', partner: 'Multi' },
  { name: 'Azul TudoAzul', color: '#0057B8', icon: '✈️', partner: 'Azul' },
];

const milesRates: Record<string, { valuePerPoint: number; transferPartners: string[]; promoTip: string }> = {
  'Smiles (GOL)': { valuePerPoint: 0.03, transferPartners: ['Itaú Platinum', 'BMG Black'], promoTip: 'Promoção semanal: GOL vende milhas por R$0,015/ponto toda terça' },
  'Latam Pass': { valuePerPoint: 0.025, transferPartners: ['Santander Ultravioleta', 'Itaú Personnalité'], promoTip: 'Bônus 100% na compra de milhas até o final do mês' },
  'Livelo': { valuePerPoint: 0.02, transferPartners: ['Itaú', 'Bradesco', 'Amex', 'BTG'], promoTip: 'Transferência 1:1 para LATAM até 31/08. Bônus 30% para Smiles' },
  'Esfera (Itaú)': { valuePerPoint: 0.022, transferPartners: ['Itaú Personnalité'], promoTip: 'Esfera acumula 1pt/R$1 nos cartões Itaú. Taxa 100% nos parceiros' },
  'Azul TudoAzul': { valuePerPoint: 0.028, transferPartners: ['Inter', 'C6 Bank'], promoTip: 'TudoAzul vende milhas por R$0,021/ponto em promoções relâmpago' },
};

const creditCardsMiles = [
  { name: 'Itaú Ultravioleta', annualFee: 'R$649/ano', earnRate: '2 milhas Livelo/R$', transferTo: 'Livelo', highlight: 'Melhor para acumular Livelo' },
  { name: 'Santander Black Ultravioleta', annualFee: 'R$599/ano', earnRate: '1.5 milhas Livelo/R$', transferTo: 'Livelo', highlight: 'Sem anuidade com R$5k/mês' },
  { name: 'C6 Bank Black', annualFee: 'R$379/ano', earnRate: '1.5 milhas TudoAzul/R$', transferTo: 'Azul', highlight: 'Melhor custo-benefício' },
  { name: 'Inter Ultra', annualFee: 'Grátis', earnRate: '1 milha Livelo/R$', transferTo: 'Livelo', highlight: 'Sem anuidade' },
];

const curatedPromos = [
  { program: 'Smiles', title: 'GOL: Milhas por R$0,015/ponto', route: 'Todas as rotas nacionais', discount: '50%', expiresAt: 'Toda terça-feira', url: 'https://www.smiles.com.br/comprar-milhas', source: 'GOL Smiles' },
  { program: 'Latam', title: 'LATAM: Bônus 100% na compra', route: 'Rotas internacionais', discount: '100%', expiresAt: 'Até 31/08/2026', url: 'https://www.latamairlines.com/br/pt/latam-pass', source: 'LATAM Pass' },
  { program: 'Livelo', title: 'Livelo: Transferência 1:1 LATAM', route: 'Itaú → LATAM', discount: '30%', expiresAt: 'Até 31/08/2026', url: 'https://www.livelo.com.br', source: 'Livelo' },
  { program: 'TudoAzul', title: 'Azul: Milhas por R$0,021/ponto', route: 'Promo relâmpago semanal', discount: '30%', expiresAt: 'Semanal', url: 'https://www.voegol.com.br/pt-br/tudoazul', source: 'Azul TudoAzul' },
  { program: 'Esfera', title: 'Esfera: 1pt por R$1 em PIX', route: 'Cartões Itaú Personnalité', discount: '10%', expiresAt: 'Permanente', url: 'https://www.bancoitau.com.br/esfera', source: 'Esfera Itaú' },
  { program: 'MaxMilhas', title: 'MaxMilhas: Passagens com desconto', route: 'Nacionais e internacionais', discount: 'Até 40%', expiresAt: 'Sempre disponível', url: 'https://www.maxmilhas.com.br/passagem-aerea-promocao', source: 'MaxMilhas' },
];

const attractions: Record<string, { morning: { name: string; desc: string }[]; lunch: { name: string; desc: string }[]; afternoon: { name: string; desc: string }[]; dinner: { name: string; desc: string }[]; transport: string[] }> = {
  'paris': { morning: [{ name: 'Torre Eiffel', desc: 'Suba ao 2º andar para vista panorâmica. Reserve online.' }, { name: 'Museu do Louvre', desc: 'Mona Lisa, Vênus de Milo. 3h mínimo.' }], lunch: [{ name: 'Café de Flore', desc: 'Café literário de Saint-Germain. Croissant + café = €8.' }], afternoon: [{ name: 'Montmartre', desc: 'Arte boêmia e Basílica do Sacré-Cœur.' }], dinner: [{ name: 'Le Comptoir du Panthéon', desc: 'Cozinha francesa clássica.' }], transport: ['Metrô 1.73€', 'Uber €10-20'] },
  'lisboa': { morning: [{ name: 'Torre de Belém', desc: 'Joia manuelina. Vista do Tejo.' }, { name: 'Alfama', desc: 'Bairro mais antigo. Fado ao vivo.' }], lunch: [{ name: 'Time Out Market', desc: 'Food hall dos melhores chefs. Bacalhau = €12.' }], afternoon: [{ name: 'Elétrico 28', desc: 'Passeio icônico pelas ruas. €3.' }], dinner: [{ name: 'Tasca do Chico', desc: 'Fado autêntico. Reserve 21h.' }], transport: ['Metrô €1.50', 'Uber €5-10'] },
  'tóquio': { morning: [{ name: 'Templo Senso-ji', desc: 'Mais antigo de Tóquio. Incenso e purificação.' }, { name: 'Shibuya Crossing', desc: 'Travessia mais famosa do mundo.' }], lunch: [{ name: 'Ichiran Ramen', desc: 'Ramen tonkotsu em cabine. ¥980.' }], afternoon: [{ name: 'Akihabara', desc: 'Eletrônicos e cultura pop.' }], dinner: [{ name: 'Omoide Yokocho', desc: 'Yakitori + cerveja por ¥1500.' }], transport: ['JR Pass ¥29.650/7d', 'Metrô ¥170-320'] },
  'bali': { morning: [{ name: 'Tanah Lot', desc: 'Templo flutuante na rocha.' }, { name: 'Tegallalang Rice Terraces', desc: 'Arrozais em terraço. Rp15.000.' }], lunch: [{ name: 'Sardine Restaurant', desc: 'Arrozais como cenário.' }], afternoon: [{ name: 'Seminyak Beach', desc: 'Beach clubs com piscina.' }], dinner: [{ name: 'Naughty Nuri', desc: 'Ribs e martini. Lendário.' }], transport: ['Moto Rp70.000/dia', 'Gojek Rp15.000-50.000'] },
};

const distances: Record<string, number> = {
  'são paulo-rio de janeiro': 430, 'são paulo-campinas': 100, 'são paulo-belo horizonte': 590,
  'são paulo-campo do jordão': 180, 'são paulo-goiânia': 930, 'são paulo-curitiba': 400,
  'são paulo-florianópolis': 700, 'são paulo-porto alegre': 1100, 'são paulo-brasília': 870,
  'rio de janeiro-belo horizonte': 440, 'rio de janeiro-espírito santo': 520,
  'campinas-campo do jordão': 180, 'campinas-campinas': 0, 'campinas-goiânia': 840,
};

export async function GET(_request: NextRequest) {
  return Response.json({
    success: true,
    data: {
      milesPrograms,
      milesRates,
      creditCardsMiles,
      curatedPromos,
      attractions,
      distances,
      fuel: { consumption: 12, price: 5.89, tollPerKm: 0.35 },
    }});
}
