'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Bell, Shield, Palette, CreditCard, ChevronRight, Loader2, Check, X, LogOut, Key, Smartphone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { changePassword } from '@/lib/api/settings';

function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' '); }

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button onClick={() => onChange(!checked)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', checked ? 'bg-primary' : 'bg-muted')}>
        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState('pro');
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [notifications, setNotifications] = React.useState({
    email: true, push: true, sms: false, whatsapp: false, priceAlerts: true, travelDeals: true, investmentAlerts: true, marketing: false,
  });
  const [passwords, setPasswords] = React.useState({ current: '', new: '', confirm: '' });

  React.useEffect(() => { setTimeout(() => setLoading(false), 300); }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => { setSaving(true); await new Promise(r => setTimeout(r, 500)); setSaving(false); showToast('Configurações salvas!'); };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || passwords.new !== passwords.confirm) {
      showToast('Preencha todos os campos corretamente', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = await changePassword({ currentPassword: passwords.current, newPassword: passwords.new, confirmPassword: passwords.confirm });
      setSaving(false);
      if (data.success) { setActiveModal(null); setPasswords({ current: '', new: '', confirm: '' }); showToast('Senha alterada com sucesso!'); }
      else showToast(data.message || 'Erro ao alterar senha', 'error');
    } catch { showToast('Erro de conexão', 'error'); }
  };

  const handlePlanChange = () => { setActiveModal(null); showToast(`Plano alterado para ${selectedPlan}!`); };

  const handleCancelSubscription = () => { setActiveModal(null); showToast('Assinatura cancelada.', 'error'); };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Configurações</h1><p className="text-muted-foreground">Gerencie suas preferências</p></div>
        <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Salvar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { id: 'notifications', title: 'Notificações', desc: 'Alertas', icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
          { id: 'appearance', title: 'Aparência', desc: 'Tema', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { id: 'security', title: 'Segurança', desc: 'Senha e MFA', icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
          { id: 'billing', title: 'Assinatura', desc: 'Plano', icon: CreditCard, color: 'text-success', bg: 'bg-success/10' },
        ].map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -1 }}>
            <div className={cn('phantom-card cursor-pointer hover:bg-muted/50', activeSection === s.id && 'ring-2 ring-primary')} onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}>
              <div className="flex items-center gap-4 p-6">
                <div className={cn('rounded-xl p-3', s.bg)}><s.icon className={cn('h-6 w-6', s.color)} /></div>
                <div className="flex-1"><h3 className="font-semibold">{s.title}</h3><p className="text-sm text-muted-foreground">{s.desc}</p></div>
                <ChevronRight className={cn('h-5 w-5 transition-transform', activeSection === s.id && 'rotate-90')} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notifications */}
      {activeSection === 'notifications' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card"><div className="p-6 pb-0"><h3 className="text-lg font-semibold">Notificações</h3></div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Canais</p>
              <Toggle label="Email" checked={notifications.email} onChange={v => setNotifications({...notifications, email: v})} />
              <Toggle label="Push" checked={notifications.push} onChange={v => setNotifications({...notifications, push: v})} />
              <Toggle label="SMS" checked={notifications.sms} onChange={v => setNotifications({...notifications, sms: v})} />
              <Toggle label="WhatsApp" checked={notifications.whatsapp} onChange={v => setNotifications({...notifications, whatsapp: v})} />
              <div className="border-t pt-4 mt-4"><p className="text-sm font-medium text-muted-foreground">Tipos</p>
                <Toggle label="Preço" checked={notifications.priceAlerts} onChange={v => setNotifications({...notifications, priceAlerts: v})} />
                <Toggle label="Viagens" checked={notifications.travelDeals} onChange={v => setNotifications({...notifications, travelDeals: v})} />
                <Toggle label="Investimentos" checked={notifications.investmentAlerts} onChange={v => setNotifications({...notifications, investmentAlerts: v})} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Appearance */}
      {activeSection === 'appearance' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card"><div className="p-6 pb-0"><h3 className="text-lg font-semibold">Aparência</h3></div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Tema</p>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <Button key={t} variant={theme === t ? 'default' : 'outline'} onClick={() => setTheme(t)}>
                    {t === 'light' ? '☀️ Claro' : t === 'dark' ? '🌙 Escuro' : '💻 Sistema'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security */}
      {activeSection === 'security' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card"><div className="p-6 pb-0"><h3 className="text-lg font-semibold">Segurança</h3></div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">Alterar Senha</p></div><Button variant="outline" size="sm" onClick={() => setActiveModal('password')}>Alterar</Button></div>
              <div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">MFA</p></div><Button variant="outline" size="sm" onClick={() => setActiveModal('mfa')}>Configurar</Button></div>
              <div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">Sessões</p></div><Button variant="outline" size="sm" onClick={() => setActiveModal('sessions')}>Gerenciar</Button></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Billing */}
      {activeSection === 'billing' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card"><div className="p-6 pb-0"><h3 className="text-lg font-semibold">Assinatura</h3></div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="text-lg font-bold text-primary">Plano Pro</h3><p className="text-sm text-muted-foreground">R$ 29,90/mês</p></div>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">ATIVO</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setActiveModal('changePlan')}>Alterar Plano</Button>
                <Button variant="destructive" className="flex-1" onClick={() => setActiveModal('cancelSubscription')}>Cancelar</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActiveModal(null)}>
          <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between p-6 pb-0"><h3 className="text-lg font-semibold">Alterar Senha</h3><Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}><X className="h-4 w-4" /></Button></div>
            <div className="p-6 space-y-4">
              <Input type="password" placeholder="Senha atual" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              <Input type="password" placeholder="Nova senha" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
              <Input type="password" placeholder="Confirmar" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              <Button onClick={handleChangePassword} disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Alterar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {activeModal === 'changePlan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActiveModal(null)}>
          <div className="phantom-card-elevated w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between p-6 pb-0"><h3 className="text-lg font-semibold">Escolher Plano</h3><Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}><X className="h-4 w-4" /></Button></div>
            <div className="p-6 space-y-4">
              {[
                { id: 'free', name: 'Free', price: 'R$ 0', features: ['Dashboard', '3 categorias'] },
                { id: 'pro', name: 'Pro', price: 'R$ 29,90/mês', features: ['IA financeira', 'Investimentos'], popular: true },
                { id: 'premium', name: 'Premium', price: 'R$ 79,90/mês', features: ['IA avançada', 'API access'] },
              ].map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={cn('cursor-pointer rounded-xl border-2 p-4 transition-all', selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-4 w-4 rounded-full border-2', selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-muted-foreground')} />
                      <span className="font-semibold">{plan.name}</span>
                      {plan.popular && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Popular</span>}
                    </div>
                    <span className="font-bold">{plan.price}</span>
                  </div>
                </div>
              ))}
              <Button onClick={handlePlanChange} className="w-full">Confirmar Alteração</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {activeModal === 'cancelSubscription' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActiveModal(null)}>
          <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Cancelar Assinatura</h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="font-medium text-destructive">Atenção!</p>
                <p className="text-sm text-muted-foreground mt-1">Você perderá acesso premium no final do período.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>Manter</Button>
                <Button variant="destructive" className="flex-1" onClick={handleCancelSubscription}>Confirmar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {activeModal === 'sessions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActiveModal(null)}>
          <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between p-6 pb-0"><h3 className="text-lg font-semibold">Sessões</h3><Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}><X className="h-4 w-4" /></Button></div>
            <div className="p-6 space-y-3">
              {[
                { device: 'Chrome - Windows', ip: '189.50.100.50', lastActive: 'Agora', current: true },
                { device: 'Safari - iPhone', ip: '189.50.100.51', lastActive: '2h atrás', current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-medium text-sm">{s.device}</p><p className="text-xs text-muted-foreground">{s.ip} • {s.lastActive}</p></div>
                  {s.current ? <span className="text-xs text-success">Atual</span> : <Button variant="ghost" size="sm" className="text-destructive"><LogOut className="h-4 w-4" /></Button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
