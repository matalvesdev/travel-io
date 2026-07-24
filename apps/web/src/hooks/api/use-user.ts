'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DeleteAccountRequest, ChangeEmailRequest } from '@/types/user';

export async function deleteAccount(data: DeleteAccountRequest) {
  const response = await fetch('/api/user/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao excluir conta');
  }

  return response.json();
}

export async function changeEmail(data: ChangeEmailRequest) {
  const response = await fetch('/api/user/change-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao mudar email');
  }

  return response.json();
}

export async function exportData() {
  const response = await fetch('/api/user/export-data', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao exportar dados');
  }

  // Handle file download
  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'travel-io-export.json';

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return { success: true, filename };
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // Invalidate all queries since account is being deleted
      queryClient.clear();
    },
  });
}

export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: exportData,
  });
}
