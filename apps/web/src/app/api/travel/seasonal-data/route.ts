import { NextRequest } from 'next/server';

const SEASONAL_DATA: Record<string, { best: string; worst: string; avgDiscount: number; tips: string[] }> = {
  'Paris': { best: 'Janeiro-Fevereiro', worst: 'Julho-Agosto', avgDiscount: 25, tips: ['Baixa temporada = hotéis 30% mais baratos', 'Voos saindo de GRU são mais baratos que GIG', 'Compre voos 60+ dias antes para melhor preço'] },
  'Tóquio': { best: 'Novembro-Dezembro', worst: 'Março-Abril', avgDiscount: 20, tips: ['Cherry blossom (Março) é caro mas vale a pena', 'Outono (Out-Nov) tem bom custo-benefício', 'Compita Japan Rail Pass antecipadamente'] },
  'Lisboa': { best: 'Novembro-Março', worst: 'Junho-Setembro', avgDiscount: 30, tips: ['Baixa temporada = hotéis 40% mais baratos', 'Voos TAP têm promoções frequentes', 'Use Smiles para voos LATAM com conexão'] },
  'Bali': { best: 'Abril-Outubro', worst: 'Dezembro-Fevereiro', avgDiscount: 35, tips: ['Evite alta temporada de Natal', 'Reserve com 90+ dias para melhor preço', 'Hotéis boutique são mais baratos que resorts'] },
  'Cancún': { best: 'Maio-Setembro', worst: 'Dezembro-Março', avgDiscount: 20, tips: ['Alta temporada = caro mas tem promoções', 'Voos GOL/Azul diretos são mais baratos', 'Pacotes All-Inclusive valem a pena'] },
  'default': { best: 'Outubro-Março', worst: 'Julho-Agosto', avgDiscount: 15, tips: ['Baixa temporada = hotéis mais baratos', 'Compre voos 45-60 dias antes', 'Use milhas para reduzir custo'] },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || '';

  let match = SEASONAL_DATA.default;
  for (const [key, value] of Object.entries(SEASONAL_DATA)) {
    if (key !== 'default' && destination.toLowerCase().includes(key.toLowerCase())) {
      match = value;
      break;
    }
  }

  return Response.json({ success: true, data: match });
}
