// ─── Types ───
export interface MilesFlightOffer {
  program: string;
  miles: number;
  taxes: number;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabin: string;
  deepLink: string;
  source: string;
}

export interface MilesScrapeResult {
  offers: MilesFlightOffer[];
  cheapest: MilesFlightOffer | null;
  source: string;
}

// ─── Smiles scraper ───
async function scrapeSmiles(
  origin: string, destination: string, date: string, adults: number
): Promise<MilesFlightOffer[]> {
  try {
    const res = await fetch(
      `https://www.smiles.com.br/api/v1/offers/search?from=${origin}&to=${destination}&date=${date}&adults=${adults}&type=award`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.smiles.com.br',
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.offers || []).map((o: any) => ({
      program: 'SMILES',
      miles: o.miles || 0,
      taxes: o.taxes || 0,
      airline: o.airline || 'G3',
      origin,
      destination,
      departureTime: o.departureTime || '',
      arrivalTime: o.arrivalTime || '',
      duration: o.duration || '',
      stops: o.stops || 0,
      cabin: o.cabin || 'ECONOMIC',
      deepLink: `https://www.smiles.com.br/passagens/${origin}-${destination}`,
      source: 'smiles',
    }));
  } catch {
    return [];
  }
}

// ─── LATAM Pass scraper ───
async function scrapeLatamPass(
  origin: string, destination: string, date: string, adults: number
): Promise<MilesFlightOffer[]> {
  try {
    const res = await fetch(
      `https://www.latamairlines.com/api/v1/flights/search?origin=${origin}&destination=${destination}&departureDate=${date}&adults=${adults}&award=true`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.latamairlines.com',
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.itineraries || []).map((i: any) => ({
      program: 'LATAM_PASS',
      miles: i.miles || 0,
      taxes: i.taxes || 0,
      airline: 'LA',
      origin,
      destination,
      departureTime: i.departureTime || '',
      arrivalTime: i.arrivalTime || '',
      duration: i.duration || '',
      stops: i.stops || 0,
      cabin: i.cabin || 'ECONOMIC',
      deepLink: `https://www.latamairlines.com/br/pt/flights/${origin}-${destination}`,
      source: 'latam',
    }));
  } catch {
    return [];
  }
}

// ─── Azul Fidelidade scraper ───
async function scrapeAzul(
  origin: string, destination: string, date: string, adults: number
): Promise<MilesFlightOffer[]> {
  try {
    const res = await fetch(
      `https://bff.voeazul.com.br/api/v1/points/search?origin=${origin}&destination=${destination}&departureDate=${date}&adults=${adults}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.voeazul.com.br',
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.trips || []).flatMap((t: any) =>
      (t.journeys || []).map((j: any) => ({
        program: 'AZUL',
        miles: j.lowestPoints || j.pointsOptions?.[0]?.points || 0,
        taxes: j.pointsOptions?.[0]?.taxesAndFees || 0,
        airline: 'AD',
        origin,
        destination,
        departureTime: j.departure || '',
        arrivalTime: j.arrival || '',
        duration: '',
        stops: j.segments?.length ? j.segments.length - 1 : 0,
        cabin: 'ECONOMIC',
        deepLink: `https://www.voeazul.com.br/br/pt/pontos/search/${origin}-${destination}`,
        source: 'azul',
      }))
    );
  } catch {
    return [];
  }
}

// ─── Fallback: known Brazilian miles table ───
const ROUTE_KM: Record<string, number> = {
  'GRU-GIG': 338, 'GRU-SSA': 1460, 'GRU-REC': 2090,
  'GRU-FOR': 2230, 'GRU-BSB': 870, 'GRU-POA': 830,
  'GRU-CWB': 340, 'GRU-CNF': 490, 'GRU-MIA': 6550,
  'GRU-JFK': 7690, 'GRU-MCO': 7100, 'GRU-LIS': 7950,
  'GRU-CDG': 9380, 'GRU-FCO': 9460, 'GRU-MAD': 8300,
  'GRU-BOG': 4240, 'GRU-EZE': 1690, 'GRU-SCL': 2600,
  'GIG-SSA': 1160, 'GIG-REC': 1800, 'GIG-FOR': 1970,
  'GIG-BSB': 920, 'GIG-POA': 1100, 'GIG-CWB': 520,
  'GIG-CNF': 340, 'GIG-MIA': 6800, 'GIG-JFK': 7800,
  'SSA-REC': 630, 'BSB-CNF': 600, 'POA-CWB': 540,
};

// Approximate miles/km ratios by program
const PROGRAM_RATIOS: Record<string, { domestic: number; international: number; taxPerKm: number }> = {
  SMILES: { domestic: 18, international: 8, taxPerKm: 0.08 },
  LATAM_PASS: { domestic: 22, international: 9, taxPerKm: 0.07 },
  AZUL: { domestic: 16, international: 7.5, taxPerKm: 0.06 },
};

function estimateDistance(origin: string, destination: string): number {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  return ROUTE_KM[key] || ROUTE_KM[reverseKey] || 1000;
}

function isDomestic(origin: string, destination: string): boolean {
  const brAirports = ['GRU', 'GIG', 'SSA', 'REC', 'FOR', 'BSB', 'POA', 'CWB', 'CNF', 'FLN', 'VIX', 'SLZ', 'BEL', 'MAO', 'THE', 'NAT', 'JPA', 'MCZ', 'AJU', 'LDB', 'CGB', 'IGU', 'CGR', 'STM', 'MCP'];
  return brAirports.includes(origin) && brAirports.includes(destination);
}

function estimateMilesFlight(
  program: string, origin: string, destination: string, date: string
): MilesFlightOffer {
  const dist = estimateDistance(origin, destination);
  const domestic = isDomestic(origin, destination);
  const ratios = PROGRAM_RATIOS[program] || PROGRAM_RATIOS.SMILES;
  const ratio = domestic ? ratios.domestic : ratios.international;
  const miles = Math.round(dist * ratio / 1000) * 1000;
  const taxes = Math.round(dist * ratios.taxPerKm);

  const depTime = `${date}T06:00:00`;
  const arrTime = `${date}T07:30:00`;

  return {
    program,
    miles: Math.max(miles, 6000),
    taxes,
    airline: program === 'SMILES' ? 'G3' : program === 'LATAM_PASS' ? 'LA' : 'AD',
    origin,
    destination,
    departureTime: depTime,
    arrivalTime: arrTime,
    duration: '',
    stops: 0,
    cabin: 'ECONOMIC',
    deepLink: '',
    source: 'estimate',
  };
}

// ─── Unified scraper ───
export async function searchMilesFlights(
  origin: string,
  destination: string,
  date: string,
  adults: number = 1,
): Promise<MilesScrapeResult> {
  const allOffers: MilesFlightOffer[] = [];

  // 1. Try APIDevoos with searchType=milhas
  const apidevoosKey = process.env.APIDEVOOS_KEY || process.env.NEXT_PUBLIC_APIDEVOOS_KEY;
  if (apidevoosKey) {
    try {
      const res = await fetch('https://app.apidevoos.dev/api/v1/flights/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apidevoosKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'one_way',
          slices: [{ origin, destination, departureDate: date }],
          passengers: [{ type: 'adult', count: adults }],
          cabinClass: 'economy',
          searchType: 'milhas',
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.flightGroups) {
          for (const group of data.flightGroups) {
            const seg = group.slices?.[0]?.segments?.[0];
            allOffers.push({
              program: 'MILHAS',
              miles: group.totalPrice?.amount || 0,
              taxes: 0,
              airline: seg?.airline?.code || '',
              origin,
              destination,
              departureTime: seg?.departureTime || '',
              arrivalTime: seg?.arrivalTime || '',
              duration: seg?.duration || '',
              stops: (group.slices?.[0]?.segments?.length || 1) - 1,
              cabin: 'ECONOMIC',
              deepLink: group.offers?.[0]?.deepLink || '',
              source: 'apidevoos',
            });
          }
        }
      }
    } catch {
      // fall through
    }
  }

  // 2. Try direct scraping in parallel
  const [smiles, latam, azul] = await Promise.all([
    scrapeSmiles(origin, destination, date, adults).catch(() => []),
    scrapeLatamPass(origin, destination, date, adults).catch(() => []),
    scrapeAzul(origin, destination, date, adults).catch(() => []),
  ]);
  allOffers.push(...smiles, ...latam, ...azul);

  // 3. Fallback: generate estimated offers
  if (allOffers.length === 0) {
    for (const program of ['SMILES', 'LATAM_PASS', 'AZUL']) {
      allOffers.push(estimateMilesFlight(program, origin, destination, date));
    }
  }

  const sorted = allOffers.sort((a, b) => a.miles - b.miles);
  return {
    offers: sorted,
    cheapest: sorted[0] || null,
    source: sorted[0]?.source || 'none',
  };
}
