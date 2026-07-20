'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plane, Hotel, Trash2, Check, X, TrendingDown, TrendingUp, RefreshCw, Loader2, MapPin, Calendar, Sparkles, Clock, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { notificationsApi, tripsApi, apiClient } from '@/lib/api';

interface PriceAlert { id: string; name: string; type: 'flight' | 'hotel'; origin?: string; destination: string; checkin: string; checkout: string; store: string; currentPrice: number; targetPrice: number; history: { price: number; date: string }[]; active: boolean; tripId?: string; }
interface SavedTrip { id: string; origin: string; destination: string; startDate: string; endDate: string; flight: any; hotel: any; totalCost: number; nights: number; savedAt: string; status: string; }
interface Notification { id: string; title: string; body: string; type: 'price_drop' | 'price_up' | 'trip_reminder' | 'promo' | 'info'; read: boolean; createdAt: string; alertId?: string; }

const ALERTS_KEY = 'travelio_price_alerts';
const TRIPS_KEY = 'travelio_saved_trips';
const NOTIF_KEY = 'travelio_notifications';
const NOTIF_PREF_KEY = 'travelio_notif_prefs';
function loadAlerts(): PriceAlert[] { try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); } catch { return []; } }
function saveAlerts(a: PriceAlert[]) { localStorage.setItem(ALERTS_KEY, JSON.stringify(a)); }
function loadTrips(): SavedTrip[] { try { return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]'); } catch { return []; } }
function loadNotifs(): Notification[] { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; } }
function saveNotifs(n: Notification[]) { localStorage.setItem(NOTIF_KEY, JSON.stringify(n)); }
function loadNotifPrefs(): boolean { try { return JSON.parse(localStorage.getItem(NOTIF_PREF_KEY) || 'true'); } catch { return true; } }

function calcTrend(history: { price: number; date: string }[]): { direction: 'up' | 'down' | 'stable'; change: number; changePct: number } {
  if (history.length < 2) return { direction: 'stable', change: 0, changePct: 0 };
  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;
  const change = last - prev;
  const changePct = prev > 0 ? (change / prev) * 100 : 0;
  return { direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable', change, changePct };
}

function pushNotification(title: string, body: string, icon = '✈️') {
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(`${icon} ${title}`, { body, icon: '/favicon.ico', badge: '/favicon.ico', tag: `travelio-${Date.now()}` }); } catch {}
  }
}

async function requestNotifPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<PriceAlert[]>([]);
  const [trips, setTrips] = React.useState<SavedTrip[]>([]);
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [checking, setChecking] = React.useState(false);
  const [notifEnabled, setNotifEnabled] = React.useState(false);
  const [showNotifPanel, setShowNotifPanel] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'alerts' | 'notifications'>('alerts');
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (m: string, t: 'success' | 'error' = 'success') => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000); };

  React.useEffect(() => {
    setAlerts(loadAlerts());
    setNotifs(loadNotifs());
    setNotifEnabled(loadNotifPrefs());
    if ('Notification' in window && Notification.permission === 'granted') setNotifEnabled(true);

    notificationsApi.getNotifications().then(res => {
      if (res.success && res.data?.notifications) {
        const mapped: Notification[] = res.data.notifications.map((n: any) => ({
          id: n.id, title: n.title, body: n.body,
          type: n.type || 'info',
          read: n.read || false,
          createdAt: n.created_at || new Date().toISOString(),
          alertId: n.alert_id || undefined,
        }));
        setNotifs(prev => {
          const merged = [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))];
          saveNotifs(merged);
          return merged;
        });
      }
    }).catch(() => {});

    tripsApi.getTrips().then(res => {
      if (res.success && res.data?.trips) {
        setTrips(res.data.trips.map((t: any) => ({
          id: t.id, origin: '—', destination: t.destination,
          startDate: t.start_date, endDate: t.end_date,
          flight: null, hotel: null, totalCost: t.budget || 0,
          nights: 0, savedAt: t.created_at || '',
          status: t.status === 'planned' ? 'planejada' : t.status === 'completed' ? 'concluída' : 'planejada',
        })));
        setTimeout(generateTripAlerts, 100);
      }
    }).catch(() => {});
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  const generateTripAlerts = () => {
    const existing = loadAlerts();
    const existingTripIds = new Set(existing.filter(a => a.tripId).map(a => a.tripId));
    const savedTrips = loadTrips();
    const newAlerts: PriceAlert[] = [];
    for (const trip of savedTrips) {
      if (trip.status === 'concluída') continue;
      if (existingTripIds.has(trip.id)) continue;
      if (trip.flight) {
        newAlerts.push({
          id: `trip-flight-${trip.id}`, name: `${trip.flight.airline} ${trip.origin}-${trip.destination}`,
          type: 'flight', origin: trip.origin, destination: trip.destination,
          checkin: trip.startDate, checkout: trip.endDate, store: 'flights',
          currentPrice: trip.flight.price, targetPrice: Math.round(trip.flight.price * 0.85),
          history: [{ price: trip.flight.price, date: trip.savedAt }], active: true, tripId: trip.id,
        });
      }
      if (trip.hotel) {
        newAlerts.push({
          id: `trip-hotel-${trip.id}`, name: trip.hotel.name,
          type: 'hotel', destination: trip.destination,
          checkin: trip.startDate, checkout: trip.endDate, store: 'booking',
          currentPrice: trip.hotel.price, targetPrice: Math.round(trip.hotel.price * 0.85),
          history: [{ price: trip.hotel.price, date: trip.savedAt }], active: true, tripId: trip.id,
        });
      }
    }
    if (newAlerts.length > 0) {
      const merged = [...existing, ...newAlerts];
      saveAlerts(merged);
      setAlerts(merged);
    }
  };

  const handleEnableNotifs = async () => {
    const granted = await requestNotifPermission();
    setNotifEnabled(granted);
    localStorage.setItem(NOTIF_PREF_KEY, JSON.stringify(granted));
    if (granted) showToast('Notificações push ativadas!');
    else showToast('Permissão negada. Ative nas configurações do navegador.', 'error');
  };

  const handleCheckPrices = async () => {
    setChecking(true);
    const updated: PriceAlert[] = [];
    const newNotifs: Notification[] = [];
    for (const alert of alerts) {
      try {
        const params = alert.type === 'flight'
          ? `origin=${alert.origin || 'GRU'}&destination=${encodeURIComponent(alert.destination)}&date=${alert.checkin}&store=latam`
          : `destination=${encodeURIComponent(alert.destination)}&checkin=${alert.checkin}&checkout=${alert.checkout}&store=booking`;
        const res = await fetch(`/api/products?${params}`, { signal: AbortSignal.timeout(120000) });
        const data = await res.json();
        const products = data.products || [];
        const match = products.find((p: any) => p.name?.toLowerCase().includes(alert.name.toLowerCase().substring(0, 15)));
        const newPrice = match?.price || alert.currentPrice;
        const oldPrice = alert.currentPrice;

        const updatedAlert = {
          ...alert, currentPrice: newPrice,
          history: [...alert.history.slice(-29), { price: newPrice, date: new Date().toISOString() }],
        };
        updated.push(updatedAlert);

        // Price dropped
        if (newPrice < oldPrice && newPrice > 0) {
          const dropPct = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
          const notif: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`, title: `Preço caiu! ${dropPct}%`,
            body: `${alert.name}: ${formatCurrency(oldPrice)} → ${formatCurrency(newPrice)} (economia de ${formatCurrency(oldPrice - newPrice)})`,
            type: 'price_drop', read: false, createdAt: new Date().toISOString(), alertId: alert.id,
          };
          newNotifs.push(notif);
          pushNotification(`Preço caiu ${dropPct}%`, `${alert.name}: ${formatCurrency(newPrice)}`, '📉');
        }

        // Price went up
        if (newPrice > oldPrice && newPrice > 0) {
          const notif: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`, title: 'Preço subiu',
            body: `${alert.name}: ${formatCurrency(oldPrice)} → ${formatCurrency(newPrice)}`,
            type: 'price_up', read: false, createdAt: new Date().toISOString(), alertId: alert.id,
          };
          newNotifs.push(notif);
        }

        // Below target
        if (alert.targetPrice > 0 && newPrice > 0 && newPrice <= alert.targetPrice) {
          pushNotification('Abaixo da meta!', `${alert.name}: ${formatCurrency(newPrice)} (meta: ${formatCurrency(alert.targetPrice)})`, '🎯');
        }
      } catch { updated.push({ ...alert }); }
    }
    setAlerts(updated);
    saveAlerts(updated);
    if (newNotifs.length > 0) {
      const mergedNotifs = [...newNotifs, ...notifs];
      setNotifs(mergedNotifs);
      saveNotifs(mergedNotifs);
      newNotifs.forEach(n => {
        apiClient.post('/api/notifications', {
          title: n.title, body: n.body, type: n.type, alert_id: n.alertId,
        }).catch(() => {});
      });
    }
    setChecking(false);
    showToast(`${updated.length} preços verificados${newNotifs.length > 0 ? ` • ${newNotifs.length} notificações` : ''}`);
  };

  const handleSetTarget = (alertId: string, target: number) => {
    const updated = alerts.map(a => a.id === alertId ? { ...a, targetPrice: target } : a);
    setAlerts(updated); saveAlerts(updated);
    showToast(`Meta definida: ${formatCurrency(target)}`);
  };

  const handleRemove = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated); saveAlerts(updated);
    showToast('Monitor removido');
  };

  const markNotifRead = (id: string) => {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated); saveNotifs(updated);
  };

  const clearAllNotifs = () => { setNotifs([]); saveNotifs([]); };

  const belowTarget = alerts.filter(a => a.targetPrice > 0 && a.currentPrice > 0 && a.currentPrice <= a.targetPrice);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'}`}>
            {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alertas & Notificações</h1>
          <p className="text-muted-foreground">{alerts.length} monitor(es) ativo{alerts.length !== 1 ? 's' : ''} • {belowTarget.length} abaixo da meta</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEnableNotifs} disabled={notifEnabled}>
            {notifEnabled ? <Bell className="mr-1 h-4 w-4 text-green-500" /> : <Bell className="mr-1 h-4 w-4" />}
            {notifEnabled ? 'Push Ativo' : 'Ativar Push'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCheckPrices} disabled={checking}>
            {checking ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
            Verificar Agora
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl w-fit">
        <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'alerts' ? 'bg-background shadow-sm' : 'hover:bg-muted/50'}`}>
          <Bell className="h-4 w-4 mr-1 inline" />Alertas ({alerts.length})
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === 'notifications' ? 'bg-background shadow-sm' : 'hover:bg-muted/50'}`}>
          <Zap className="h-4 w-4 mr-1 inline" />Notificações {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unreadCount}</span>}
        </button>
      </div>

      {activeTab === 'alerts' ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="phantom-card p-4"><div className="flex items-center gap-3"><div className="rounded-xl p-2 bg-primary/10"><Bell className="h-4 w-4 text-primary" /></div><div><p className="text-[11px] text-muted-foreground">Monitorando</p><p className="text-lg font-bold">{alerts.length}</p></div></div></div>
            <div className="phantom-card p-4"><div className="flex items-center gap-3"><div className="rounded-xl p-2 bg-green-500/10"><TrendingDown className="h-4 w-4 text-green-500" /></div><div><p className="text-[11px] text-muted-foreground">Abaixo da Meta</p><p className="text-lg font-bold text-green-600">{belowTarget.length}</p></div></div></div>
            <div className="phantom-card p-4"><div className="flex items-center gap-3"><div className="rounded-xl p-2 bg-amber-500/10"><TrendingUp className="h-4 w-4 text-amber-500" /></div><div><p className="text-[11px] text-muted-foreground">Aguardando</p><p className="text-lg font-bold text-amber-600">{alerts.length - belowTarget.length}</p></div></div></div>
            <div className="phantom-card p-4"><div className="flex items-center gap-3"><div className="rounded-xl p-2 bg-blue-500/10"><Target className="h-4 w-4 text-blue-500" /></div><div><p className="text-[11px] text-muted-foreground">Com Meta</p><p className="text-lg font-bold">{alerts.filter(a => a.targetPrice > 0).length}</p></div></div></div>
          </div>

          {/* Below target highlight */}
          {belowTarget.length > 0 && (
            <div className="phantom-card p-4 bg-green-500/5 border border-green-500/20">
              <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1"><Sparkles className="h-4 w-4" /> Preços abaixo da meta!</p>
              {belowTarget.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/5 mb-1">
                  <span className="text-xs font-bold text-green-600">{formatCurrency(a.currentPrice)}</span>
                  <span className="text-xs text-muted-foreground">meta: {formatCurrency(a.targetPrice)}</span>
                  <span className="text-xs text-green-600 font-semibold">-{Math.round(((a.targetPrice - a.currentPrice) / a.targetPrice) * 100)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Alerts list */}
          {alerts.length === 0 ? (
            <div className="phantom-card p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhum alerta configurado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Salve uma viagem para criar alertas automáticos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => {
                const trend = calcTrend(alert.history);
                const isBelow = alert.targetPrice > 0 && alert.currentPrice > 0 && alert.currentPrice <= alert.targetPrice;
                const savings = alert.history.length >= 2 ? alert.history[0].price - alert.currentPrice : 0;
                return (
                  <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`phantom-card p-4 ${isBelow ? 'ring-2 ring-green-500/30 bg-green-500/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.type === 'flight' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                        {alert.type === 'flight' ? <Plane className="h-5 w-5 text-blue-500" /> : <Hotel className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{alert.name}</p>
                          {isBelow && <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">META!</span>}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{alert.destination} • <Calendar className="h-3 w-3" />{alert.checkin}
                          {alert.tripId && <span className="text-blue-500">• Viagem salva</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(alert.currentPrice)}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {trend.direction === 'down' && <><TrendingDown className="h-3 w-3 text-green-500" /><span className="text-xs text-green-600">{trend.changePct.toFixed(1)}%</span></>}
                          {trend.direction === 'up' && <><TrendingUp className="h-3 w-3 text-red-500" /><span className="text-xs text-red-500">+{trend.changePct.toFixed(1)}%</span></>}
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-[10px] text-muted-foreground mb-1">Meta</p>
                        {alert.targetPrice > 0 ? (
                          <p className="text-sm font-semibold">{formatCurrency(alert.targetPrice)}</p>
                        ) : (
                          <button onClick={() => handleSetTarget(alert.id, Math.round(alert.currentPrice * 0.85))} className="text-xs text-primary hover:underline">Definir meta</button>
                        )}
                      </div>
                      <div className="text-right w-24">
                        <p className="text-[10px] text-muted-foreground mb-1">Histórico</p>
                        <div className="flex gap-0.5 justify-end">
                          {alert.history.slice(-10).map((h, j) => {
                            const minP = Math.min(...alert.history.slice(-10).map(x => x.price));
                            const maxP = Math.max(...alert.history.slice(-10).map(x => x.price));
                            const range = maxP - minP || 1;
                            const height = 8 + ((h.price - minP) / range) * 16;
                            return <div key={j} className="w-1.5 rounded-full" style={{ height: `${height}px`, backgroundColor: h.price <= alert.targetPrice && alert.targetPrice > 0 ? '#22c55e' : h.price < (alert.history.slice(-10)[0]?.price || h.price) ? '#3b82f6' : '#ef4444' }} />;
                          })}
                        </div>
                      </div>
                      <button onClick={() => handleRemove(alert.id)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{notifs.length} notificação{notifs.length !== 1 ? 'ões' : ''} • {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}</p>
            {notifs.length > 0 && <Button variant="outline" size="sm" onClick={clearAllNotifs}><Trash2 className="h-3 w-3 mr-1" /> Limpar</Button>}
          </div>

          {!notifEnabled && (
            <div className="phantom-card p-5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center"><Bell className="h-5 w-5 text-white" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Ative notificações push</p>
                  <p className="text-xs text-muted-foreground">Receba alertas quando o preço de voo ou hotel baixar, mesmo com o app fechado.</p>
                </div>
                <Button size="sm" onClick={handleEnableNotifs}><Bell className="h-3 w-3 mr-1" /> Ativar</Button>
              </div>
            </div>
          )}

          {notifs.length === 0 ? (
            <div className="phantom-card p-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Verifique os preços para gerar notificações</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifs.map((notif, i) => (
                <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`phantom-card p-4 cursor-pointer transition-all ${!notif.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-70'}`}
                  onClick={() => markNotifRead(notif.id)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.type === 'price_drop' ? 'bg-green-500/10' : notif.type === 'price_up' ? 'bg-red-500/10' : notif.type === 'promo' ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}>
                      {notif.type === 'price_drop' ? <TrendingDown className="h-4 w-4 text-green-500" /> : notif.type === 'price_up' ? <TrendingUp className="h-4 w-4 text-red-500" /> : notif.type === 'promo' ? <Sparkles className="h-4 w-4 text-purple-500" /> : <Bell className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(notif.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
