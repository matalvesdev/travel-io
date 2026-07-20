'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Clock, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  date: string;
  url: string;
}

interface NewsSectionProps {
  initialNews?: NewsItem[];
}

export function NewsSection({ initialNews = [] }: NewsSectionProps) {
  const [period, setPeriod] = React.useState('day');
  const [news, setNews] = React.useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchNews = React.useCallback(async (p: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/external?period=${p}`);
      if (res.ok) {
        const data = await res.json();
        if (data.news?.length > 0) {
          setNews(data.news);
          setLoading(false);
          return;
        }
      }
      // Fallback to original news endpoint
      const fallbackRes = await fetch(`/api/news?period=${p}`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.news?.length > 0) {
          setNews(fallbackData.news);
          setLoading(false);
          return;
        }
      }
      setError('Unable to fetch news');
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchNews(period);
  }, [period, fetchNews]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="h-4 w-4 text-primary" />
            Notícias Financeiras
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-xl border bg-card/50 overflow-hidden">
              {[
                { v: 'day', l: 'Dia' },
                { v: 'week', l: 'Semana' },
                { v: 'month', l: 'Mês' },
                { v: 'year', l: 'Ano' },
              ].map(f => (
                <button
                  key={f.v}
                  onClick={() => setPeriod(f.v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    period === f.v
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {f.l}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchNews(period)}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchNews(period)}>
              <RefreshCw className="mr-1 h-3 w-3" /> Tentar novamente
            </Button>
          </div>
        ) : news.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma notícia disponível no momento
          </p>
        ) : (
          <div className="space-y-2">
            {news.slice(0, 5).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'hsl(var(--muted) / 0.3)' }}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}
              >
                <div className="rounded-lg bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title || 'Notícia'}
                  </p>
                  {item.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {item.source && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {item.source}
                      </span>
                    )}
                    {item.date && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                {item.url && item.url !== '#' && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary mt-1 flex-shrink-0 transition-colors" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
