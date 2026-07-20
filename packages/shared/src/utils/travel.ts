export function calcNights(checkin: string, checkout: string): number {
  const start = new Date(checkin);
  const end = new Date(checkout);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function calcTotalCost(flightPrice: number, hotelPrice: number, nights: number): number {
  return flightPrice + hotelPrice * nights;
}

export function findCheapest<T extends { price: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items.reduce((min, item) => item.price < min.price ? item : min, items[0]);
}
