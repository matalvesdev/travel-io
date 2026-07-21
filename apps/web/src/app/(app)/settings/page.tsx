'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Bell, Shield, Palette, Loader2, Check, X, LogOut, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { useProfile, useUpdateProfile } from '@/hooks/api/use-profile';
import { useSessions, useRevokeSession, useChangePassword, useUpdateNotificationPreferences } from '@/hooks/api/use-settings';

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
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const changePassword = useChangePassword();
  const updateNotifications = useUpdateNotificationPreferences();

  const [profileForm, setProfileForm] = React.useState({ name: '', email: '' });
  const [passwords, setPasswords] = React.useState({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = React.useState({
    email: true, push: true, sms: false, whatsapp: false, priceAlerts: true, travelDeals: true, investmentAlerts: true, marketing: false,
  });

  React.useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name || '', email: profile.email || '' });
    }
  }, [profile]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.email) {
      showToast('Nome e email são obrigatórios', 'error');
      return;
    }
    updateProfile.mutate(
      { name: profileForm.name, email: profileForm.email },
      {
        onSuccess: () => showToast('Perfil atualizado com sucesso!'),
        onError: () => showToast('Erro ao atualizar perfil', 'error'),
      }
    );
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || passwords.new !== passwords.confirm) {
      showToast('Preencha todos os campos corretamente', 'error');
      return;
    }
    changePassword.mutate(
      { currentPassword: passwords.current, newPassword: passwords.new, confirmPassword: passwords.confirm },
      {
        onSuccess: (data) => {
          if (data.success) {
            setActiveModal(null);
            setPasswords({ current: '', new: '', confirm: '' });
            showToast('Senha alterada com sucesso!');
          } else {
            showToast(data.message || 'Erro ao alterar senha', 'error');
          }
        },
        onError: () => showToast('Erro de conexão', 'error'),
      }
    );
  };

  const handleRevokeSession = (sessionId: string) => {
    revokeSession.mutate(sessionId, {
      onSuccess: () => showToast('Sessão revogada'),
      onError: () => showToast('Erro ao revogar sessão', 'error'),
    });
  };

  const handleSaveNotifications = () => {
    updateNotifications.mutate({
      emailEnabled: notifications.email,
      pushEnabled: notifications.push,
      smsEnabled: notifications.sms,
      whatsappEnabled: notifications.whatsapp,
      priceAlerts: notifications.priceAlerts,
      travelDeals: notifications.travelDeals,
      investmentAlerts: notifications.investmentAlerts,
      marketing: notifications.marketing,
    }, {
      onSuccess: () => showToast('Preferências salvas!'),
      onError: () => showToast('Erro ao salvar preferências', 'error'),
    });
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências</p>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { id: 'profile', title: 'Perfil', desc: 'Nome e email', icon: User, color: 'text-primary', bg: 'bg-primary/10' },
          { id: 'security', title: 'Segurança', desc: 'Senha e sessões', icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
          { id: 'notifications', title: 'Notificações', desc: 'Preferências', icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
          { id: 'appearance', title: 'Aparência', desc: 'Tema', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -1 }}>
            <div className={cn('phantom-card cursor-pointer hover:bg-muted/50', activeSection === s.id && 'ring-2 ring-primary')} onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}>
              <div className="flex items-center gap-4 p-6">
                <div className={cn('rounded-xl p-3', s.bg)}><s.icon className={cn('h-6 w-6', s.color)} /></div>
                <div className="flex-1"><h3 className="font-semibold">{s.title}</h3><p className="text-sm text-muted-foreground">{s.desc}</p></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card">
            <div className="p-6 pb-0"><h3 className="text-lg font-semibold">Perfil</h3></div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              {profile?.avatarUrl && (
                <div className="flex items-center gap-3">
                  <img src={profile.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full" />
                  <span className="text-sm text-muted-foreground">Avatar via OAuth</span>
                </div>
              )}
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Salvar Perfil
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card">
            <div className="p-6 pb-0"><h3 className="text-lg font-semibold">Segurança</h3></div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium">Alterar Senha</p></div>
                <Button variant="outline" size="sm" onClick={() => setActiveModal('password')}>Alterar</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div><p className="font-medium">Sessões Ativas ({sessions.length})</p></div>
                <Button variant="outline" size="sm" onClick={() => setActiveModal('sessions')}>Gerenciar</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card">
            <div className="p-6 pb-0"><h3 className="text-lg font-semibold">Notificações</h3></div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Canais</p>
              <Toggle label="Email" checked={notifications.email} onChange={v => setNotifications({...notifications, email: v})} />
              <Toggle label="Push" checked={notifications.push} onChange={v => setNotifications({...notifications, push: v})} />
              <Toggle label="SMS" checked={notifications.sms} onChange={v => setNotifications({...notifications, sms: v})} />
              <Toggle label="WhatsApp" checked={notifications.whatsapp} onChange={v => setNotifications({...notifications, whatsapp: v})} />
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-muted-foreground">Tipos</p>
                <Toggle label="Alertas de Preço" checked={notifications.priceAlerts} onChange={v => setNotifications({...notifications, priceAlerts: v})} />
                <Toggle label="Ofertas de Viagem" checked={notifications.travelDeals} onChange={v => setNotifications({...notifications, travelDeals: v})} />
                <Toggle label="Alertas de Investimento" checked={notifications.investmentAlerts} onChange={v => setNotifications({...notifications, investmentAlerts: v})} />
                <Toggle label="Marketing" checked={notifications.marketing} onChange={v => setNotifications({...notifications, marketing: v})} />
              </div>
              <Button onClick={handleSaveNotifications} disabled={updateNotifications.isPending}>
                {updateNotifications.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Salvar Preferências
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Appearance Section */}
      {activeSection === 'appearance' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <div className="phantom-card">
            <div className="p-6 pb-0"><h3 className="text-lg font-semibold">Aparência</h3></div>
            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Tema</p>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <Button key={t} variant={theme === t ? 'default' : 'outline'} onClick={() => setTheme(t)}>
                    {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Sistema'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActiveModal(null)}>
          <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold">Alterar Senha</h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <Input type="password" placeholder="Senha atual" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              <Input type="password" placeholder="Nova senha" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
              <Input type="password" placeholder="Confirmar nova senha" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              <Button onClick={handleChangePassword} disabled={changePassword.isPending} className="w-full">
                {changePassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Alterar Senha
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {activeModal === 'sessions' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setActiveModal(null)}>
          <div className="phantom-card-elevated w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold">Sessões Ativas</h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6 space-y-3">
              {sessionsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nenhuma sessão encontrada</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{s.device} - {s.browser}</p>
                      <p className="text-xs text-muted-foreground">{s.ip} • {s.lastActive}</p>
                    </div>
                    {s.isCurrent ? (
                      <span className="text-xs text-success font-medium">Atual</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={revokeSession.isPending}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
