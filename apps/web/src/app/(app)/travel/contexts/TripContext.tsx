'use client';
import * as React from 'react';
import { Plane, Hotel, Coffee, Map, Navigation } from 'lucide-react';
import { CITY_TO_AIRPORT } from '@/lib/data/cities';
import { tripsApi, milesApi, apiClient, referenceDataApi } from '@/lib/api';
import type { TravelReferenceData } from '@/lib/api';

export type Step = 'plan' | 'flights' | 'hotels' | 'confirm' | 'itinerary' | 'miles' | 'saved';
export interface FlightResult { id: string; airline: string; price: number; duration: string; stops: string; origin: string; destination: string; deepLink?: string; flightNumber?: string; }
export interface HotelResult { id: string; name: string; price: number; rating: number; reviews?: number; address: string; imageUrl?: string; url?: string; amenities?: string[]; }
export interface ItineraryItem { day: number; title: string; type: 'travel' | 'hotel' | 'activity' | 'food'; time: string; description: string; icon: any; duration?: string; cost?: string; }
export interface MilesAccount { program: string; balance: number; expiring: number; expiryDate: string; color: string; }
export interface SavedTrip { id: string; origin: string; destination: string; startDate: string; endDate: string; flight: FlightResult | null; hotel: HotelResult | null; totalCost: number; nights: number; savedAt: string; status: 'planejada' | 'em andamento' | 'concluída'; }

interface TripState {
  step: Step; setStep: (s: Step) => void;
  origin: string; setOrigin: (v: string) => void;
  destination: string; setDestination: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  travelers: string; setTravelers: (v: string) => void;
  searching: boolean; setSearching: (v: boolean) => void;
  flights: FlightResult[]; setFlights: (v: FlightResult[]) => void;
  hotels: HotelResult[]; setHotels: (v: HotelResult[]) => void;
  selectedFlight: FlightResult | null; setSelectedFlight: (v: FlightResult | null) => void;
  selectedHotel: HotelResult | null; setSelectedHotel: (v: HotelResult | null) => void;
  viewingFlight: FlightResult | null; setViewingFlight: (v: FlightResult | null) => void;
  itinerary: ItineraryItem[]; setItinerary: (v: ItineraryItem[]) => void;
  itineraryDay: number; setItineraryDay: (v: number) => void;
  milesAccounts: MilesAccount[]; setMilesAccounts: (v: MilesAccount[]) => void;
  savedTrips: SavedTrip[]; setSavedTrips: (v: SavedTrip[]) => void;
  milesSearchResults: FlightResult[]; setMilesSearchResults: (v: FlightResult[]) => void;
  milesSearching: boolean; setMilesSearching: (v: boolean) => void;
  milesOrigin: string; setMilesOrigin: (v: string) => void;
  milesDest: string; setMilesDest: (v: string) => void;
  milesDate: string; setMilesDate: (v: string) => void;
  hotelStarFilter: number; setHotelStarFilter: (v: number) => void;
  hotelPriceMax: number; setHotelPriceMax: (v: number) => void;
  hotelSortBy: 'price' | 'rating'; setHotelSortBy: (v: 'price' | 'rating') => void;
  toast: { message: string; type: 'success' | 'error' } | null; setToast: (v: any) => void;
  refData: TravelReferenceData | null;

  originAirport: string; destAirport: string;
  nights: number; cheapestFlight: FlightResult | null; cheapestHotel: HotelResult | null;
  filteredHotels: HotelResult[]; totalCost: number; totalMiles: number;
  ref: TravelReferenceData | undefined;

  showToast: (m: string, t?: 'success' | 'error') => void;
  searchFlights: () => Promise<void>;
  searchHotels: () => Promise<void>;
  handleSaveTrip: () => Promise<void>;
  searchMilesFlights: () => Promise<void>;
  generateItinerary: () => void;
}

const TripContext = React.createContext<TripState | null>(null);

export function useTrip() { const ctx = React.useContext(TripContext); if (!ctx) throw new Error('useTrip must be used within TripProvider'); return ctx; }

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = React.useState<Step>('plan');
  const [origin, setOrigin] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [travelers, setTravelers] = React.useState('2');
  const [searching, setSearching] = React.useState(false);
  const [flights, setFlights] = React.useState<FlightResult[]>([]);
  const [hotels, setHotels] = React.useState<HotelResult[]>([]);
  const [selectedFlight, setSelectedFlight] = React.useState<FlightResult | null>(null);
  const [selectedHotel, setSelectedHotel] = React.useState<HotelResult | null>(null);
  const [viewingFlight, setViewingFlight] = React.useState<FlightResult | null>(null);
  const [itinerary, setItinerary] = React.useState<ItineraryItem[]>([]);
  const [itineraryDay, setItineraryDay] = React.useState(1);
  const [milesAccounts, setMilesAccounts] = React.useState<MilesAccount[]>([]);
  const [savedTrips, setSavedTrips] = React.useState<SavedTrip[]>([]);
  const [milesSearchResults, setMilesSearchResults] = React.useState<FlightResult[]>([]);
  const [milesSearching, setMilesSearching] = React.useState(false);
  const [milesOrigin, setMilesOrigin] = React.useState('');
  const [milesDest, setMilesDest] = React.useState('');
  const [milesDate, setMilesDate] = React.useState('');
  const [hotelStarFilter, setHotelStarFilter] = React.useState(0);
  const [hotelPriceMax, setHotelPriceMax] = React.useState(99999);
  const [hotelSortBy, setHotelSortBy] = React.useState<'price' | 'rating'>('price');
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refData, setRefData] = React.useState<TravelReferenceData | null>(null);

  React.useEffect(() => {
    referenceDataApi.get().then(res => { if (res.success && res.data?.data) setRefData(res.data.data); }).catch(() => {});
    milesApi.getBalance().then(res => {
      if (res.success && res.data?.programs) {
        setMilesAccounts(res.data.programs.map((a: any) => ({
          program: a.programName || a.program, balance: a.balance,
          expiring: a.expiringIn30Days || 0, expiryDate: a.expiringDate || '', color: '#6366f1',
        })));
      }
    }).catch(() => {});
    tripsApi.getTrips().then(res => {
      if (res.success && res.data?.trips) {
        setSavedTrips(res.data.trips.map((t: any) => ({
          id: t.id, origin: '—', destination: t.destination,
          startDate: t.start_date, endDate: t.end_date,
          flight: null, hotel: null, totalCost: t.budget || 0, nights: 0,
          savedAt: t.created_at || new Date().toISOString(),
          status: (t.status === 'planned' ? 'planejada' : t.status === 'ongoing' ? 'em andamento' : t.status === 'completed' ? 'concluída' : 'planejada') as SavedTrip['status'],
        })));
      }
    }).catch(() => {});
  }, []);

  const showToast = (m: string, t: 'success' | 'error' = 'success') => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000); };

  const originAirport = CITY_TO_AIRPORT[origin.toLowerCase()] || 'GRU';
  const destAirport = CITY_TO_AIRPORT[destination.toLowerCase()] || '';
  const nights = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 3;
  const cheapestFlight = flights.length > 0 ? flights.reduce((a, b) => a.price < b.price ? a : b) : null;
  const cheapestHotel = hotels.length > 0 ? hotels.reduce((a, b) => a.price < b.price ? a : b) : null;
  const filteredHotels = hotels.filter(h => {
    if (hotelStarFilter > 0 && Math.round(h.rating) < hotelStarFilter) return false;
    if (h.price > hotelPriceMax) return false;
    return true;
  }).sort((a, b) => hotelSortBy === 'price' ? a.price - b.price : b.rating - a.rating);
  const totalCost = (selectedFlight?.price || cheapestFlight?.price || 0) + (selectedHotel?.price || cheapestHotel?.price || 0) * nights;
  const totalMiles = milesAccounts.reduce((a, m) => a + m.balance, 0);
  const ref = refData || undefined;

  const searchFlights = async () => {
    setSearching(true);
    showToast('Buscando voos...');
    try {
      const res = await fetch('/api/flights', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: originAirport, destination: destAirport || originAirport, departureDate: startDate, returnDate: endDate, adults: parseInt(travelers) || 1, cabinClass: 'economy' }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (data.error) { showToast(`Erro: ${data.error}`, 'error'); setFlights([]); }
      else {
        const results: FlightResult[] = (data.flightGroups || []).map((g: any, i: number) => {
          const itin = g.flightInfo?.itineraries?.[0]; const seg = itin?.segments?.[0]; const lastSeg = itin?.segments?.[itin.segments.length - 1];
          const offer = g.offers?.find((o: any) => o.isBestOffer) || g.offers?.[0]; const durMins = itin?.duration || 0;
          return { id: g.signature || `f-${i}`, airline: seg?.marketingCarrier?.name || 'Companhia Aérea', price: offer?.price?.total || 0, duration: `${Math.floor(durMins / 60)}h ${durMins % 60}m`, stops: (itin?.stops || 0) === 0 ? 'Direto' : `${itin?.stops} escala(s)`, origin: seg?.departure?.airport || originAirport, destination: lastSeg?.arrival?.airport || destination, deepLink: offer?.booking?.bookingUrl || '', flightNumber: seg?.flightNumber ? `${seg.marketingCarrier?.code || ''}${seg.flightNumber}` : '' };
        }).filter((f: FlightResult) => f.price > 0);
        setFlights(results);
        showToast(`${results.length} voos encontrados!`);
      }
    } catch { showToast('Erro ao buscar voos', 'error'); setFlights([]); }
    setSearching(false);
  };

  const searchHotels = async () => {
    setSearching(true); showToast('Buscando hotéis...');
    try {
      const res = await fetch(`/api/products?destination=${encodeURIComponent(destination)}&checkin=${startDate}&checkout=${endDate}&store=booking&guests=${parseInt(travelers) || 1}`, { signal: AbortSignal.timeout(45000) });
      const data = await res.json();
      const results: HotelResult[] = (data.products || []).map((h: any, i: number) => ({ id: h.id || `h-${i}`, name: h.name || '', price: h.price || 0, rating: Math.min(h.rating || 0, 5), reviews: h.reviews || 0, address: h.address || destination, imageUrl: h.imageUrl || '', amenities: h.amenities || [] }));
      setHotels(results);
      if (results.length > 0) setHotelPriceMax(Math.max(...results.map(h => h.price)) + 1);
      showToast(`${results.length} hotéis encontrados!`);
    } catch { showToast('Erro ao buscar hotéis', 'error'); setHotels([]); }
    setSearching(false);
  };

  const handleSaveTrip = async () => {
    const trip: SavedTrip = { id: `trip-${Date.now()}`, origin, destination, startDate, endDate, flight: selectedFlight, hotel: selectedHotel, totalCost, nights, savedAt: new Date().toISOString(), status: 'planejada' };
    try {
      await tripsApi.createTrip({ destination, start_date: startDate, end_date: endDate, budget: totalCost, status: 'planned' });
      const updated = [...savedTrips, trip]; setSavedTrips(updated); setStep('saved');
      showToast('Viagem salva com sucesso!');
    } catch { showToast('Erro ao salvar viagem', 'error'); }
  };

  const searchMilesFlights = async () => {
    if (!milesOrigin || !milesDest || !milesDate) { showToast('Preencha origem, destino e data', 'error'); return; }
    setMilesSearching(true);
    try {
      const res = await fetch('/api/flights', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: destAirport || milesOrigin, destination: destAirport || milesDest, departureDate: milesDate, adults: 1, cabinClass: 'economy', searchType: 'milhas' }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      const results: FlightResult[] = (data.flightGroups || []).map((g: any, i: number) => {
        const itin = g.flightInfo?.itineraries?.[0]; const seg = itin?.segments?.[0];
        const offer = g.offers?.find((o: any) => o.isBestOffer) || g.offers?.[0]; const durMins = itin?.duration || 0;
        return { id: g.signature || `m-${i}`, airline: seg?.marketingCarrier?.name || 'Companhia Aérea', price: offer?.price?.total || 0, duration: `${Math.floor(durMins / 60)}h ${durMins % 60}m`, stops: (itin?.stops || 0) === 0 ? 'Direto' : `${itin?.stops} escala(s)`, origin: seg?.departure?.airport || '', destination: '', deepLink: offer?.booking?.bookingUrl || '', flightNumber: '' };
      }).filter((f: FlightResult) => f.price > 0);
      setMilesSearchResults(results);
      showToast(`${results.length} voos com milhas encontrados!`);
    } catch { showToast('Erro na busca por milhas', 'error'); setMilesSearchResults([]); }
    setMilesSearching(false);
  };

  const generateItinerary = () => {
    const attractions = ref?.attractions || {};
    const fallback = { morning: [{ name: 'Explorar o centro', desc: 'Conheça as ruas principais.' }], lunch: [{ name: 'Restaurante típico', desc: 'Comida local autêntica.' }], afternoon: [{ name: 'Passeio livre', desc: 'Sua escolha.' }], dinner: [{ name: 'Jantar na cidade', desc: 'Gastronomia local.' }], transport: ['Transporte público', 'Uber'] };
    const cd = (Object.entries(attractions).find(([k]) => destination.toLowerCase().includes(k)) || ['', fallback])[1] as typeof fallback;
    const items: ItineraryItem[] = [];
    items.push({ day: 1, title: `Chegada em ${destination}`, type: 'travel', time: '14:00', description: `Voo ${selectedFlight?.airline || ''} ${selectedFlight?.duration ? '• ' + selectedFlight.duration : ''}`, icon: Plane, cost: selectedFlight ? `R$ ${selectedFlight.price}` : '' });
    items.push({ day: 1, title: 'Transfer', type: 'travel', time: '15:30', description: cd.transport[0], icon: Navigation });
    items.push({ day: 1, title: selectedHotel?.name || 'Hotel', type: 'hotel', time: '16:00', description: `Check-in • R$ ${selectedHotel?.price || 0}/noite`, icon: Hotel });
    items.push({ day: 1, title: cd.dinner[0].name, type: 'food', time: '19:00', description: cd.dinner[0].desc, icon: Coffee, cost: '~R$ 80-150' });
    for (let d = 2; d <= Math.min(nights, 7); d++) {
      const m = (d - 2) % cd.morning.length, l = (d - 2) % cd.lunch.length, a = (d - 2) % cd.afternoon.length, di = (d - 2) % cd.dinner.length;
      items.push({ day: d, title: cd.morning[m].name, type: 'activity', time: '09:00', description: cd.morning[m].desc, icon: Map, duration: '~2-3h' });
      items.push({ day: d, title: cd.lunch[l].name, type: 'food', time: '12:30', description: cd.lunch[l].desc, icon: Coffee, cost: '~R$ 60-120' });
      items.push({ day: d, title: cd.afternoon[a].name, type: 'activity', time: '14:30', description: cd.afternoon[a].desc + ` • ${cd.transport[a % cd.transport.length]}`, icon: Map, duration: '~2-3h' });
      if (d < nights) items.push({ day: d, title: cd.dinner[di].name, type: 'food', time: '19:30', description: cd.dinner[di].desc, icon: Coffee });
    }
    items.push({ day: nights + 1, title: 'Check-out', type: 'hotel', time: '08:00', description: selectedHotel?.name || 'Hotel', icon: Hotel });
    items.push({ day: nights + 1, title: 'Transfer Aeroporto', type: 'travel', time: '11:00', description: cd.transport[0], icon: Navigation });
    items.push({ day: nights + 1, title: `Volta para ${origin}`, type: 'travel', time: '14:00', description: 'Bom retorno!', icon: Plane });
    setItinerary(items);
  };

  const value: TripState = {
    step, setStep, origin, setOrigin, destination, setDestination,
    startDate, setStartDate, endDate, setEndDate, travelers, setTravelers,
    searching, setSearching, flights, setFlights, hotels, setHotels,
    selectedFlight, setSelectedFlight, selectedHotel, setSelectedHotel,
    viewingFlight, setViewingFlight, itinerary, setItinerary, itineraryDay, setItineraryDay,
    milesAccounts, setMilesAccounts, savedTrips, setSavedTrips,
    milesSearchResults, setMilesSearchResults, milesSearching, setMilesSearching,
    milesOrigin, setMilesOrigin, milesDest, setMilesDest, milesDate, setMilesDate,
    hotelStarFilter, setHotelStarFilter, hotelPriceMax, setHotelPriceMax, hotelSortBy, setHotelSortBy,
    toast, setToast, refData,
    originAirport, destAirport, nights, cheapestFlight, cheapestHotel, filteredHotels, totalCost, totalMiles, ref,
    showToast, searchFlights, searchHotels, handleSaveTrip, searchMilesFlights, generateItinerary,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
