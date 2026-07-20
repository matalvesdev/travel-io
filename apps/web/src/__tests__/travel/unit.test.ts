import { describe, it, expect } from 'vitest';

// ============ Pure functions extracted from Travel module ============

/** Calculate number of nights between two dates */
function calcNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

/** Find cheapest item in array */
function findCheapest<T extends { price: number }>(items: T[]): T | null {
  return items.length > 0 ? items.reduce((a, b) => a.price < b.price ? a : b) : null;
}

/** Calculate total trip cost: flights + (hotel price × nights) */
function calcTotalCost(flightPrice: number, hotelPricePerNight: number, nights: number): number {
  return flightPrice + hotelPricePerNight * nights;
}

/** Generate itinerary items */
function generateItinerary(params: {
  origin: string;
  destination: string;
  nights: number;
  airline: string;
  hotelName: string;
}) {
  const items: Array<{ day: number; title: string; type: string; time: string; description: string }> = [];
  const { origin, destination, nights, airline, hotelName } = params;

  // Day 1: Arrival
  items.push({ day: 1, title: `Chegada em ${destination}`, type: 'travel', time: '14:00', description: `Voo ${airline}` });
  items.push({ day: 1, title: 'Check-in Hotel', type: 'hotel', time: '16:00', description: hotelName });
  items.push({ day: 1, title: 'Explorar a região', type: 'activity', time: '18:00', description: 'Passeio livre' });

  // Middle days
  for (let d = 2; d <= nights; d++) {
    items.push({ day: d, title: `Dia ${d} — Descobertas`, type: 'activity', time: '09:00', description: 'Pontos turísticos' });
    items.push({ day: d, title: 'Almoço', type: 'food', time: '12:00', description: 'Restaurantes locais' });
    items.push({ day: d, title: 'Tarde livre', type: 'activity', time: '14:00', description: 'Compras ou descanso' });
  }

  // Last day: Return
  items.push({ day: nights + 1, title: `Volta para ${origin}`, type: 'travel', time: '10:00', description: 'Check-out e retorno' });

  return items;
}

/** Parse origin/destination airport codes */
function resolveCity(code: string): string {
  const map: Record<string, string> = {
    'GRU': 'sao paulo', 'GIG': 'rio de janeiro', 'BSB': 'brasilia',
    'VCP': 'campinas', 'CDG': 'paris', 'LHR': 'londres',
    'JFK': 'nova york', 'NRT': 'tokio', 'LIS': 'lisboa',
  };
  return map[code.toUpperCase()] || code.toLowerCase();
}

// ============ Tests ============

describe('calcNights', () => {
  it('calculates 4 nights for a 5-day trip', () => {
    expect(calcNights('2026-08-01', '2026-08-05')).toBe(4);
  });

  it('calculates 1 night for same-day (minimum)', () => {
    expect(calcNights('2026-08-01', '2026-08-01')).toBe(1);
  });

  it('calculates 7 nights for a week trip', () => {
    expect(calcNights('2026-08-01', '2026-08-08')).toBe(7);
  });

  it('calculates 30 nights for a month', () => {
    expect(calcNights('2026-08-01', '2026-08-31')).toBe(30);
  });

  it('handles month boundary', () => {
    expect(calcNights('2026-08-30', '2026-09-03')).toBe(4);
  });
});

describe('findCheapest', () => {
  it('returns cheapest flight', () => {
    const flights = [
      { id: '1', price: 5000, airline: 'LATAM' },
      { id: '2', price: 3000, airline: 'GOL' },
      { id: '3', price: 4500, airline: 'Azul' },
    ];
    const cheapest = findCheapest(flights);
    expect(cheapest?.id).toBe('2');
    expect(cheapest?.price).toBe(3000);
  });

  it('returns cheapest hotel', () => {
    const hotels = [
      { id: '1', name: 'Hilton', price: 800 },
      { id: '2', name: 'F1', price: 200 },
      { id: '3', name: 'Marriott', price: 600 },
    ];
    const cheapest = findCheapest(hotels);
    expect(cheapest?.name).toBe('F1');
  });

  it('returns null for empty array', () => {
    expect(findCheapest([])).toBeNull();
  });

  it('returns the only item if single', () => {
    expect(findCheapest([{ id: '1', price: 999 }])?.id).toBe('1');
  });
});

describe('calcTotalCost', () => {
  it('calculates flight + hotel × nights', () => {
    // Flight R$3000 + Hotel R$200/night × 4 nights = R$3800
    expect(calcTotalCost(3000, 200, 4)).toBe(3800);
  });

  it('handles 1 night', () => {
    expect(calcTotalCost(3000, 200, 1)).toBe(3200);
  });

  it('handles zero flight price', () => {
    expect(calcTotalCost(0, 500, 3)).toBe(1500);
  });

  it('handles zero hotel price', () => {
    expect(calcTotalCost(3000, 0, 5)).toBe(3000);
  });

  it('handles large numbers', () => {
    expect(calcTotalCost(15000, 2500, 7)).toBe(32500);
  });
});

describe('generateItinerary', () => {
  it('generates correct number of items for 4-night trip', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 4, airline: 'LATAM', hotelName: 'Hilton',
    });
    // Day 1: 3 items, Days 2-4: 3 items each (9), Day 5: 1 item
    expect(items.length).toBe(3 + 9 + 1);
  });

  it('generates correct number of items for 1-night trip', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 1, airline: 'LATAM', hotelName: 'Hilton',
    });
    // Day 1: 3 items, Day 2: 1 item (return)
    expect(items.length).toBe(4);
  });

  it('first item is arrival', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 2, airline: 'LATAM', hotelName: 'Hilton',
    });
    expect(items[0].title).toContain('Paris');
    expect(items[0].type).toBe('travel');
    expect(items[0].day).toBe(1);
  });

  it('last item is return', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 3, airline: 'LATAM', hotelName: 'Hilton',
    });
    const last = items[items.length - 1];
    expect(last.title).toContain('São Paulo');
    expect(last.type).toBe('travel');
    expect(last.day).toBe(4); // nights + 1
  });

  it('includes hotel check-in on day 1', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 2, airline: 'LATAM', hotelName: 'Hilton Paris',
    });
    const hotel = items.find(i => i.type === 'hotel');
    expect(hotel).toBeDefined();
    expect(hotel!.day).toBe(1);
    expect(hotel!.description).toBe('Hilton Paris');
  });

  it('middle days have activity + food + activity pattern', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 3, airline: 'LATAM', hotelName: 'Hilton',
    });
    // Day 2 and 3 should have 3 items each
    const day2Items = items.filter(i => i.day === 2);
    expect(day2Items.length).toBe(3);
    expect(day2Items[0].type).toBe('activity');
    expect(day2Items[1].type).toBe('food');
    expect(day2Items[2].type).toBe('activity');
  });

  it('itinerary is day-sequential', () => {
    const items = generateItinerary({
      origin: 'São Paulo', destination: 'Paris',
      nights: 5, airline: 'LATAM', hotelName: 'Hilton',
    });
    let prevDay = 0;
    for (const item of items) {
      expect(item.day).toBeGreaterThanOrEqual(prevDay);
      prevDay = item.day;
    }
  });
});

describe('resolveCity', () => {
  it('resolves GRU to são paulo', () => {
    expect(resolveCity('GRU')).toBe('sao paulo');
  });

  it('resolves CDG to paris', () => {
    expect(resolveCity('CDG')).toBe('paris');
  });

  it('returns lowercase for unknown code', () => {
    expect(resolveCity('XXX')).toBe('xxx');
  });

  it('handles lowercase input', () => {
    expect(resolveCity('gru')).toBe('sao paulo');
  });
});
