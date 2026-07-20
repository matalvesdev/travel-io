'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { User, Loader2, Check, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile, useUpdateProfile } from '@/hooks/api';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = React.useState({ name: '', email: '', phone: '', birthDate: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        birthDate: profile.birthDate ?? '',
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/profile', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      toast.success('Foto atualizada!');
    } catch { toast.error('Erro ao enviar foto'); }
    setUploading(false);
  };

  const handleSave = () => {
    updateProfile.mutate(form, {
      onSuccess: () => toast.success('Perfil salvo com sucesso!'),
      onError: () => toast.error('Erro ao salvar perfil'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="phantom-card w-full max-w-md">
          <div className="flex flex-col items-center gap-4 p-6">
            <p className="text-muted-foreground">Erro ao carregar perfil</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">Gerencie seus dados pessoais</p>
        </div>
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Salvar
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="phantom-card lg:col-span-2">
          <div className="p-6 pb-0"><h3 className="text-lg font-semibold">Dados Pessoais</h3></div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Nascimento</label>
                <Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>
        </div>
        <div className="phantom-card">
          <div className="p-6 pb-0"><h3 className="text-lg font-semibold">Foto</h3></div>
          <div className="p-6 flex flex-col items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-12 w-12" />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg hover:bg-primary/90 transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
            <p className="text-xs text-muted-foreground mt-3">Clique no ícone para alterar</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
