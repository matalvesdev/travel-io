export function parseBRL(value: string): number {
  let cleaned = value.replace(/R\$/g, '').replace(/\s/g, '');
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseDate(dateStr: string): string | null {
  if (/^\d{5}$/.test(dateStr)) {
    const serial = parseInt(dateStr);
    if (serial > 40000 && serial < 50000) {
      const d = new Date((serial - 25569) * 86400 * 1000);
      return d.toISOString().split('T')[0];
    }
  }
  const formats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (match[0].startsWith(match[3])) {
        return `${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}-${match[3]}`;
      }
      return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    }
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return null;
}
