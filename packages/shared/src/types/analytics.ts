export interface Insight {
  id: string;
  title: string;
  description: string;
  priority: string;
}

export interface ForecastItem {
  month: string;
  forecast: number;
  confidence: number;
}
