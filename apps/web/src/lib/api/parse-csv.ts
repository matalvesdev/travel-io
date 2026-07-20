// Parse CSV/OFX/XLSX para transações financeiras

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  method?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

const COLUMN_MAPPINGS = {
  date: ['data', 'date', 'dt', 'data_transacao', 'data_compra', 'transaction_date'],
  description: ['descricao', 'description', 'desc', 'historico', 'memo', 'detail', 'nome', 'estabelecimento'],
  amount: ['valor', 'amount', 'value', 'quantia', 'montante'],
  type: ['tipo', 'type', 'category_type'],
  category: ['categoria', 'category', 'group', 'grupo'],
};

/**
 * Normalize category name for matching: lowercase, trim, collapse spaces around / and +
 */
function normalizeCat(s: string): string {
  return s.toLowerCase()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map raw FM Home category names to clean system categories.
 */
const FM_CATEGORY_MAP: Record<string, string> = {
  // Income
  'ludens': 'Renda', 'bottcher': 'Renda', 'consultório': 'Renda', 'resgate': 'Renda',
  'empréstimo hugo': 'Renda', 'empréstimo cris': 'Renda',

  // Moradia
  'aluguel+água+energia': 'Moradia', 'aluguel': 'Moradia',
  'internet+celular': 'Moradia',
  'macbook': 'Educação', 'macbook+empréstimo': 'Educação',
  'macbook+empréstimo mãe': 'Educação',
  'persiana': 'Moradia', 'jardineiro': 'Moradia', 'faxina': 'Moradia',
  'sala aluguel flor': 'Moradia', 'sala-aluguel flor': 'Moradia',
  'água': 'Moradia', 'energia': 'Moradia',
  'sanasa': 'Moradia', 'cpfl': 'Moradia',

  // Saúde
  'conselho de fono': 'Saúde', 'psicoterapia': 'Saúde', 'psicólogo': 'Saúde',
  'unimed': 'Saúde', 'podóloga': 'Saúde', 'farmácia/saúde': 'Saúde',
  'beleza/saúde': 'Saúde', 'farmácia': 'Saúde',

  // Pets
  'petcamp': 'Pets', 'petcamp+petlove': 'Pets', 'petlove': 'Pets',
  'paco/meli': 'Pets', 'paco/melí': 'Pets', 'paco/melí/nala': 'Pets',
  'paco': 'Pets', 'melí': 'Pets', 'meli': 'Pets', 'nala': 'Pets',

  // Educação
  'inglês': 'Educação', 'faculdade': 'Educação', 'marketing': 'Educação',
  'livros/material': 'Educação', 'cursos': 'Educação',

  // Dívidas
  'acordo serasa': 'Dívidas', 'empréstimo banco': 'Dívidas',

  // Alimentação
  'casa/alimentação': 'Alimentação', 'restaurantes/saídas': 'Alimentação',
  'supermercado': 'Alimentação', 'mercearia': 'Alimentação', 'merceária': 'Alimentação',
  'alimentação/casa': 'Alimentação', 'refeições': 'Alimentação',
  'mercado': 'Alimentação', 'alimentação': 'Alimentação',
  'restaurantes': 'Alimentação', 'total comida': 'Alimentação',

  // Casa
  'coisas para casa': 'Casa', 'coisas para casa/consultório': 'Casa',
  'casa/outros': 'Casa',

  // Vestuário
  'roupas': 'Vestuário', 'cosméticos/maquiagem/acessórios': 'Vestuário',
  'pernambucanas': 'Vestuário', 'renner': 'Vestuário',

  // Trabalho
  'material trabalho': 'Trabalho', 'trabalho': 'Trabalho',

  // Lazer geral
  'estudos': 'Lazer', 'passeios': 'Lazer', 'diversos': 'Lazer', 'streamings': 'Lazer',

  // Transporte
  'ônibus': 'Transporte', 'uber': 'Transporte', 'transporte': 'Transporte',

  // Outros
  'dízimo': 'Outros', 'presentes': 'Outros',
  'outros': 'Outros', 'fundos': 'Outros', 'dinheiro guardado': 'Outros',
  'cartão': 'Outros',
};

function mapFMCategory(raw: string): string {
  const normalized = normalizeCat(raw);
  if (FM_CATEGORY_MAP[normalized]) return FM_CATEGORY_MAP[normalized];

  // Partial key match
  for (const [key, val] of Object.entries(FM_CATEGORY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) return val;
  }

  // Fallback heuristics
  if (normalized.includes('aluguel') || normalized.includes('água') || normalized.includes('energia') || normalized.includes('sanasa') || normalized.includes('cpfl')) return 'Moradia';
  if (normalized.includes('internet') || normalized.includes('celular')) return 'Moradia';
  if (normalized.includes('supermercado') || normalized.includes('alimentação') || normalized.includes('restaurante') || normalized.includes('ifood') || normalized.includes('restaurantes')) return 'Alimentação';
  if (normalized.includes('farmácia') || normalized.includes('saúde') || normalized.includes('beleza') || normalized.includes('médic')) return 'Saúde';
  if (normalized.includes('pet') || normalized.includes('paco') || normalized.includes('animal')) return 'Pets';
  if (normalized.includes('lazer') || normalized.includes('passeio') || normalized.includes('show') || normalized.includes('netflix') || normalized.includes('spotify') || normalized.includes('streaming')) return 'Lazer';
  if (normalized.includes('educação') || normalized.includes('curso') || normalized.includes('faculdade') || normalized.includes('livro')) return 'Educação';
  if (normalized.includes('roupa') || normalized.includes('vestuário') || normalized.includes('shein') || normalized.includes('cosmétic') || normalized.includes('renner') || normalized.includes('pernambucanas')) return 'Vestuário';
  if (normalized.includes('casa') || normalized.includes('coisa') || normalized.includes('consultório')) return 'Casa';
  if (normalized.includes('serasa') || normalized.includes('dívida') || normalized.includes('empréstimo') || normalized.includes('acordo')) return 'Dívidas';
  if (normalized.includes('transporte') || normalized.includes('uber') || normalized.includes('ônibus') || normalized.includes('combustível')) return 'Transporte';
  if (normalized.includes('renda') || normalized.includes('salário') || normalized.includes('ludens') || normalized.includes('bottcher')) return 'Renda';
  if (normalized.includes('resgate') || normalized.includes('investimento')) return 'Renda';
  if (normalized.includes('trabalho') || normalized.includes('material trabalho')) return 'Trabalho';
  if (normalized.includes('cartão') || normalized.includes('nubank') || normalized.includes('itau') || normalized.includes('c6')) return 'Outros';
  if (normalized.includes('streaming') || normalized.includes('netflix') || normalized.includes('spotify') || normalized.includes('amazon prime') || normalized.includes('canva') || normalized.includes('deezer')) return 'Lazer';
  return 'Outros';
}

export function parseCSV(content: string): ParsedTransaction[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const columnMap = detectColumns(headers);
  const transactions: ParsedTransaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
    try {
      const t = parseRow(values, columnMap);
      if (t) transactions.push(t);
    } catch (e) { console.warn(`Linha ${i + 1} ignorada: ${e}`); }
  }
  return transactions;
}

function detectColumns(headers: string[]) {
  let dateIdx = -1, descIdx = -1, amountIdx = -1, catIdx = -1;
  headers.forEach((header, idx) => {
    const lower = header.toLowerCase();
    if (COLUMN_MAPPINGS.date.some(d => lower.includes(d))) dateIdx = idx;
    if (COLUMN_MAPPINGS.description.some(d => lower.includes(d))) descIdx = idx;
    if (COLUMN_MAPPINGS.amount.some(a => lower.includes(a))) amountIdx = idx;
    if (COLUMN_MAPPINGS.category.some(c => lower.includes(c))) catIdx = idx;
  });
  return { date: dateIdx, description: descIdx, amount: amountIdx, category: catIdx };
}

function parseRow(values: string[], columnMap: { date: number; description: number; amount: number; category: number }): ParsedTransaction | null {
  if (columnMap.date === -1 || columnMap.description === -1 || columnMap.amount === -1) return null;
  const date = parseDate(values[columnMap.date] || '');
  if (!date) return null;
  const description = values[columnMap.description] || '';
  const amount = parseAmount(values[columnMap.amount] || '0');
  const type: 'INCOME' | 'EXPENSE' = amount >= 0 ? 'INCOME' : 'EXPENSE';
  const category = columnMap.category !== -1 ? values[columnMap.category] : detectCategory(description);
  return { date, description, amount: Math.abs(amount), type, category };
}

function parseDate(dateStr: string): string | null {
  if (typeof dateStr === 'number' || /^\d{5}$/.test(dateStr)) {
    const serial = parseInt(String(dateStr));
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
      if (format.source.includes('yyyy')) {
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      } else {
        return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
      }
    }
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return null;
}

export function parseAmount(amountStr: string): number {
  let cleaned = amountStr.replace(/R\$/g, '').replace(/\s/g, '');
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts[parts.length - 1].length <= 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

function detectCategory(description: string): string {
  const lower = description.toLowerCase();
  const categories: { [key: string]: string[] } = {
    'Alimentação': ['supermercado', 'mercado', 'padaria', 'restaurante', 'ifood', 'alimentação', 'mercearia', 'oxxo', 'savegnago', 'carrefour', 'enxuto', 'pague menos', 'bk', 'popeyes', 'mcdonald', 'starbucks', 'pizza', '99 food'],
    'Transporte': ['uber', '99', 'combustivel', 'gasolina', 'ônibus', 'metro'],
    'Moradia': ['aluguel', 'condominio', 'iptu', 'luz', 'agua', 'sanasa', 'cpfl', 'internet', 'celular'],
    'Saúde': ['farmacia', 'hospital', 'unimed', 'conselho', 'psicologo', 'psicoterapia', 'academia', 'drogasil', 'drogaraia'],
    'Educação': ['faculdade', 'curso', 'macbook', 'inglês', 'marketing', 'livro'],
    'Lazer': ['cinema', 'netflix', 'spotify', 'petcamp', 'show', 'passeio', 'bar'],
    'Investimentos': ['corretora', 'banco', 'renda fixa', 'acao', 'fii', 'resgate'],
    'Dívidas': ['serasa', 'empréstimo', 'acordo'],
  };
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Outros';
}

export function parseOFX(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  let match;
  while ((match = transactionRegex.exec(content)) !== null) {
    const block = match[1];
    const date = extractOFXField(block, 'DTPOSTED');
    const amount = extractOFXField(block, 'TRNAMT');
    const description = extractOFXField(block, 'NAME') || extractOFXField(block, 'MEMO');
    if (date && amount && description) {
      const parsedDate = parseDate(date.substring(0, 8));
      const parsedAmount = parseFloat(amount);
      if (parsedDate && !isNaN(parsedAmount)) {
        transactions.push({
          date: parsedDate, description,
          amount: Math.abs(parsedAmount),
          type: parsedAmount >= 0 ? 'INCOME' : 'EXPENSE',
          category: detectCategory(description),
        });
      }
    }
  }
  return transactions;
}

function extractOFXField(block: string, field: string): string | null {
  const regex = new RegExp(`<${field}>\\s*([^<]+)`);
  const m = block.match(regex);
  return m ? m[1].trim() : null;
}

/**
 * Split concatenated detail text by "+".
 * Only splits when "+" is clearly separating distinct items (not within a single name).
 * Does NOT split by "/" — "/" is always a date separator (DD/MM) or installment (N/N) in detail text.
 */
/**
 * Split detail text by "+" AND " - " separators.
 * Example: "Criança Tagarela 3/12 - Lembranças Despedida+ Cartões 1/5+ Balões Sala"
 * → 3 items: "Criança Tagarela", "Lembranças Despedida", "Cartões", "Balões Sala"
 */
function splitDetailText(text: string): { name: string; amount?: number }[] {
  if (!text) return [];
  // First split by " - " or " – " (em-dash), then by "+"
  let preSplit = text.split(/\s*[-–]\s*/).filter(Boolean);
  let parts: string[] = [];
  for (const segment of preSplit) {
    const subParts = segment.split('+').map(s => s.trim()).filter(Boolean);
    parts.push(...subParts);
  }
  if (parts.length <= 1) return [{ name: text.trim() }];

  // Check if any part has a trailing number (amount): "C6 Flor 661,25"
  const amountRe = /\s+([\d]+[.,]?\d{0,2})\s*$/;
  let hasAnyAmount = false;

  const parsed = parts.map(part => {
    const m = part.match(amountRe);
    if (m && m[1]) {
      hasAnyAmount = true;
      const name = part.slice(0, part.length - m[0].length).trim();
      const amount = parseAmount(m[1]);
      return { name: name || part.trim(), amount: Math.abs(amount) };
    }
    return { name: part.trim() };
  });

  if (!hasAnyAmount) {
    // No amounts — treat as single description
    return [{ name: text.trim() }];
  }
  return parsed.filter(p => p.name);
}

/**
 * Extract date from detail text patterns like "05/06 99 Food", "Savegnago 03/08",
 * "Oxxo - 09/12", or category names like "C6 Flor/Mateus- compra dia 03".
 * Returns { day, month } if found, null otherwise.
 */
function extractDetailDate(text: string, fallbackMonth: number): { year: number; month: number; day: number } | null {
  // Pattern 0: "compra dia DD" in category names
  const m0 = text.match(/compra\s+dia\s+(\d{1,2})/i);
  if (m0) return { year: 0, month: 0, day: parseInt(m0[1]) };

  // Pattern 1: "DD/MM StoreName" at the start
  const m1 = text.match(/^(\d{1,2})\/(\d{1,2})\s+/);
  if (m1) return { year: 0, month: parseInt(m1[2]), day: parseInt(m1[1]) };

  // Pattern 2: "StoreName DD/MM" at the end (trailing)
  const m2 = text.match(/\s+(\d{1,2})\/(\d{1,2})\s*$/);
  if (m2) return { year: 0, month: parseInt(m2[2]), day: parseInt(m2[1]) };

  // Pattern 3: "StoreName - DD/MM"
  const m3 = text.match(/[-–]\s*(\d{1,2})\/(\d{1,2})/);
  if (m3) return { year: 0, month: parseInt(m3[2]), day: parseInt(m3[1]) };

  return null;
}

/** Clean category names: remove "compra dia X", trailing dashes, installment refs */
function cleanCategoryName(raw: string): string {
  let clean = raw.trim();
  // Remove "- compra dia DD" pattern
  clean = clean.replace(/\s*[-–]\s*compra\s+dia\s+\d{1,2}/gi, '');
  // Remove trailing "- " or " -"
  clean = clean.replace(/\s*[-–]\s*$/, '');
  return clean.trim();
}

/** Clean detail text: remove leading/trailing date, installments, dashes, raw Excel dates */
function cleanDetailText(text: string): string {
  let clean = text.trim();
  // Remove raw Excel serial dates like "2026-10-02 00:00:00"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(clean)) return '';
  // Remove leading "DD/MM " or "DD/MM-"
  clean = clean.replace(/^\d{1,2}\/\d{1,2}\s+[-–]?\s*/, '');
  // Remove trailing " - DD/MM" or " DD/MM" or " DD/MM/YY"
  clean = clean.replace(/\s*[-–]\s*\d{1,2}\/\d{1,2}(\/\d{2,4})?\s*$/, '');
  clean = clean.replace(/\s+\d{1,2}\/\d{1,2}(\/\d{2,4})?\s*$/, '');
  // Remove trailing installment "N/N"
  clean = clean.replace(/\s+\d{1,2}\/\d{1,2}$/, '');
  return clean.trim();
}

/** Map "/" category names as a SINGLE category — never split */
function splitCategory(raw: string): string[] {
  // Always return as single item — "/" categories are ONE category
  return [raw];
}

/** Calculate the correct year for a detail text date given its column month */
function calcDateYear(detailMonth: number, colMonth: number, sheetYear: number): number {
  return sheetYear;
}

/** Format a date string YYYY-MM-DD */
function fmtDate(y: number, m: number, d: number): string {
  const safeDay = Math.min(d, new Date(y, m, 0).getDate());
  return `${y}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

/** Negative amount = refund/income, positive = expense (for F/V rows) */
function resolveType(currentType: string, amount: number): 'INCOME' | 'EXPENSE' {
  if (amount < 0) return 'INCOME';
  return currentType as 'INCOME' | 'EXPENSE';
}

/** Parse FM Home year sheet */
function parseFMHomeSheet(XLSXLib: any, sheet: any, year: number): ParsedTransaction[] {
  const data = XLSXLib.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
  if (data.length < 3) return [];

  const transactions: ParsedTransaction[] = [];
  const months: { month: number; valorIdx: number; detalheIdx: number }[] = [];
  const row1 = data[0] || [];

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  for (let m = 0; m < 12; m++) {
    const valorIdx = 4 + m * 3;
    const detalheIdx = 2 + m * 3;
    // Skip months beyond current month
    if (year > currentYear || (year === currentYear && (m + 1) > currentMonth)) continue;
    if (valorIdx >= row1.length) continue;
    // Only include month if at least one row has a non-zero value
    let hasData = false;
    for (let r = 2; r < data.length; r++) {
      const val = String(data[r]?.[valorIdx] || '').trim();
      if (val && val !== '0' && val !== '' && val !== '#REF!') { hasData = true; break; }
    }
    if (!hasData) continue;
    months.push({ month: m + 1, valorIdx, detalheIdx });
  }
  if (months.length === 0) return [];

  let currentType: 'INCOME' | 'EXPENSE' = 'EXPENSE';
  let lastCategoryByType: Record<string, string> = { INCOME: 'Renda', EXPENSE: 'Outros' };

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    const colA = String(row[0] || '').trim();
    const colB = String(row[1] || '').trim();

    // Skip TOTAL rows (check both colA and colB)
    const combinedLabel = (colA + ' ' + colB).toUpperCase();
    if (combinedLabel.includes('TOTAL') || combinedLabel.includes('FINAL') || combinedLabel.includes('RECEBIDO')) continue;

    const hasAnyValue = months.some(m => {
      const v = String(row[m.valorIdx] || '').trim();
      return v && v !== '0' && v !== '#REF!' && v !== '';
    });

    // Section headers — skip even if they have values (they are totals for the section)
    if (!['R', 'F', 'V'].includes(colA)) {
      const upper = colA.toUpperCase();
      if (upper.includes('RENDA')) currentType = 'INCOME';
      else if (upper.includes('GASTOS') || upper.includes('INVESTIMENTO')) currentType = 'EXPENSE';
      if (!colA && colB) lastCategoryByType[currentType] = colB;
      continue; // Always skip section header rows
    }

    if (colA === 'R') currentType = 'INCOME';
    else if (colA === 'F' || colA === 'V') currentType = 'EXPENSE';

    if (colB) lastCategoryByType[currentType] = colB;
    const rawCategory = colB || lastCategoryByType[currentType] || 'Outros';
    const categories = splitCategory(rawCategory).map(c => mapFMCategory(c));

    for (const m of months) {
      const valorRaw = String(row[m.valorIdx] || '').trim();
      if (!valorRaw || valorRaw === '0' || valorRaw === '#REF!' || valorRaw === '') continue;

      const totalAmount = parseAmount(valorRaw);
      if (totalAmount === 0) continue;
      const txType = resolveType(currentType, totalAmount);

      const detalheIdx = m.month === 1 ? 2 : m.detalheIdx;
      const detailText = String(row[detalheIdx] || '').trim();

      // CATEGORY TOTAL DETECTION
      if (!detailText && totalAmount > 0) {
        let isTotal = false;
        const checkDetalheIdx = m.month === 1 ? 2 : m.detalheIdx;
        for (let j = i + 1; j < Math.min(i + 60, data.length); j++) {
          const nextRow = data[j];
          if (!nextRow) continue;
          const nextColA = String(nextRow[0] || '').trim();
          // Stop at section header (colA NOT in R/F/V and NOT empty)
          if (nextColA && !['R', 'F', 'V'].includes(nextColA)) break;
          // Check detail text in same month column
          const nextDetail = String(nextRow[checkDetalheIdx] || '').trim();
          if (nextDetail) { isTotal = true; break; }
          // Named category with same value = total match
          if (['R', 'F', 'V'].includes(nextColA) && nextRow[1]) {
            const nextValor = String(nextRow[m.valorIdx] || '').trim();
            if (nextValor && nextValor !== '0' && nextValor !== '#REF!' && nextValor !== '') {
              const nv = parseAmount(nextValor);
              if (nv > 0 && Math.abs(nv - totalAmount) < 0.01) { isTotal = true; break; }
            }
          }
        }
        if (isTotal) continue;
      }

      // Extract day from detail text only — NOT from category name "compra dia"
      let detailDate = extractDetailDate(detailText, m.month);
      // Always use the column month for the transaction date
      // The DD/MM in detail text is only a reference, not the actual date
      let txDay = 15;
      if (detailDate && detailDate.day > 0 && detailDate.day <= 31) {
        txDay = detailDate.day;
      }
      const txDate = fmtDate(year, m.month, txDay);

      // Clean description name
      const cleanName = cleanDetailText(detailText);
      const cat = categories[0] || 'Outros';

      // Detect installment pattern "N/M" in detail text
      const installmentMatch = detailText.match(/(\d{1,2})\/(\d{1,2})\s*$/);
      let installmentCurrent: number | undefined;
      let installmentTotal: number | undefined;
      if (installmentMatch) {
        installmentCurrent = parseInt(installmentMatch[1]);
        installmentTotal = parseInt(installmentMatch[2]);
      }

      if (!detailText) {
        // No detail — one transaction with the mapped category
        const cleanCatName = cleanCategoryName(cat);
        transactions.push({
          date: txDate,
          description: cleanCatName,
          amount: Math.abs(totalAmount),
          type: txType,
          category: cat,
        });
        continue;
      }

      // Split detail text by "+"
      const items = splitDetailText(detailText);
      const itemsWithAmount = items.filter(it => it.amount !== undefined);
      const itemsWithoutAmount = items.filter(it => it.amount === undefined);

      if (itemsWithAmount.length > 0 && itemsWithoutAmount.length > 0) {
        const sumKnown = itemsWithAmount.reduce((s, it) => s + (it.amount || 0), 0);
        const remaining = Math.max(0, totalAmount - sumKnown);
        const perUnknown = itemsWithoutAmount.length > 0 ? remaining / itemsWithoutAmount.length : 0;

        for (const item of items) {
          const itemAmount = item.amount || perUnknown;
          if (itemAmount <= 0) continue;
          const name = cleanDetailText(item.name) || item.name;
          const itemDate = extractDetailDate(name, m.month);
          const itemDay = (itemDate && itemDate.day > 0) ? itemDate.day : 15;
          const itemTxDate = fmtDate(year, m.month, itemDay);
          const cleanItemName = cleanDetailText(name) || name;
          const itemInst = item.name?.match(/(\d{1,2})\/(\d{1,2})\s*$/);
          transactions.push({
            date: itemTxDate,
            description: cleanItemName,
            amount: Math.abs(itemAmount),
            type: txType,
            category: cat,
            installmentCurrent: itemInst ? parseInt(itemInst[1]) : undefined,
            installmentTotal: itemInst ? parseInt(itemInst[2]) : undefined,
          });
        }
      } else if (itemsWithAmount.length > 0) {
        for (const item of itemsWithAmount) {
          if (!item.amount || item.amount <= 0) continue;
          const name = cleanDetailText(item.name!) || item.name;
          const itemDate = extractDetailDate(name, m.month);
          const itemDay = (itemDate && itemDate.day > 0) ? itemDate.day : 15;
          const itemTxDate = fmtDate(year, m.month, itemDay);
          const cleanItemName = cleanDetailText(name) || name;
          const itemInst = item.name?.match(/(\d{1,2})\/(\d{1,2})\s*$/);
          transactions.push({
            date: itemTxDate,
            description: cleanItemName,
            amount: Math.abs(item.amount),
            type: txType,
            category: cat,
            installmentCurrent: itemInst ? parseInt(itemInst[1]) : undefined,
            installmentTotal: itemInst ? parseInt(itemInst[2]) : undefined,
          });
        }
      } else {
        const name = cleanDetailText(detailText) || detailText;
        transactions.push({
          date: txDate,
          description: name,
          amount: Math.abs(totalAmount),
          type: txType,
          category: cat,
        });
      }
    }
  }

  const todayNow = new Date();
  const todayStr = `${todayNow.getFullYear()}-${String(todayNow.getMonth() + 1).padStart(2, '0')}-${String(todayNow.getDate()).padStart(2, '0')}`;

  // Deduplicate: remove transactions with same date + amount
  const seen = new Set<string>();
  return transactions.filter(t => {
    const key = `${t.date}|${t.amount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    // Filter out future dates beyond today
    if (t.date > todayStr) return false;
    return true;
  });
}

/** Parse generic spreadsheet */
function parseGenericSheet(XLSXLib: any, sheet: any, _sheetName: string): ParsedTransaction[] {
  const data = XLSXLib.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  if (data.length < 2) return [];
  let headerIdx = -1;
  const headers: string[] = [];
  for (let i = 0; i < Math.min(data.length, 5); i++) {
    const row = data[i];
    if (row && row.some((cell: any) => {
      const s = String(cell || '').toLowerCase();
      return s.includes('data') || s.includes('valor') || s.includes('descricao');
    })) {
      headerIdx = i;
      data[i].forEach((cell: any) => headers.push(String(cell || '').toLowerCase().trim()));
      break;
    }
  }
  if (headerIdx === -1) return [];
  const dateIdx = headers.findIndex(h => COLUMN_MAPPINGS.date.some(d => h.includes(d)));
  const descIdx = headers.findIndex(h => COLUMN_MAPPINGS.description.some(d => h.includes(d)));
  const amountIdx = headers.findIndex(h => COLUMN_MAPPINGS.amount.some(a => h.includes(a)));
  const catIdx = headers.findIndex(h => COLUMN_MAPPINGS.category.some(c => h.includes(c)));
  const typeIdx = headers.findIndex(h => COLUMN_MAPPINGS.type.some(t => h.includes(t)));
  if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) return [];
  const transactions: ParsedTransaction[] = [];
  for (let i = headerIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const date = parseDate(String(row[dateIdx] || ''));
    const description = String(row[descIdx] || '');
    if (!date || !description) continue;
    const amount = parseAmount(String(row[amountIdx] || '0'));
    if (amount === 0) continue;
    const typeHint = typeIdx !== -1 ? String(row[typeIdx] || '').toLowerCase() : undefined;
    let type: 'INCOME' | 'EXPENSE';
    if (typeHint === 'receita' || typeHint === 'income' || typeHint === 'r') type = 'INCOME';
    else if (typeHint === 'despesa' || typeHint === 'expense' || typeHint === 'f' || typeHint === 'v') type = 'EXPENSE';
    else type = amount > 0 ? 'INCOME' : 'EXPENSE';
    const category = catIdx !== -1 ? String(row[catIdx] || '') : detectCategory(description);
    transactions.push({ date, description: description.trim(), amount: Math.abs(amount), type, category });
  }
  return transactions;
}

export async function parseXLSX(buffer: ArrayBuffer): Promise<ParsedTransaction[]> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const transactions: ParsedTransaction[] = [];
  for (const sheetName of workbook.SheetNames) {
    const yearMatch = sheetName.match(/^(\d{4})$/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 2020 && year <= 2030) {
        transactions.push(...parseFMHomeSheet(XLSX, workbook.Sheets[sheetName], year));
        continue;
      }
    }
    transactions.push(...parseGenericSheet(XLSX, workbook.Sheets[sheetName], sheetName));
  }
  return transactions;
}

export function exportToCSV(transactions: ParsedTransaction[]): string {
  const headers = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'];
  const rows = transactions.map(t => [
    t.date, `"${t.description}"`, t.amount.toFixed(2).replace('.', ','),
    t.type === 'INCOME' ? 'Receita' : 'Despesa', t.category || '',
  ]);
  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}
