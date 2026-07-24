import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountSettings } from '@/components/user/account-settings';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock all hooks
vi.mock('@/hooks/api/use-user', () => ({
  useChangeEmail: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteAccount: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useExportData: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('AccountSettings', () => {
  it('should render account settings section', () => {
    render(<AccountSettings />);
    expect(screen.getByText('Configurações da Conta')).toBeInTheDocument();
  });

  it('should show change email section', () => {
    render(<AccountSettings />);
    expect(screen.getByText('Mudar Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('novo@email.com')).toBeInTheDocument();
  });

  it('should show export data section', () => {
    render(<AccountSettings />);
    expect(screen.getByText('Exportar Dados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument();
  });

  it('should show delete account section', () => {
    render(<AccountSettings />);
    expect(screen.getByText('Excluir Conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /excluir/i })).toBeInTheDocument();
  });

  it('should disable update button when email is empty', () => {
    render(<AccountSettings />);
    const updateButton = screen.getByRole('button', { name: /atualizar/i });
    expect(updateButton).toBeDisabled();
  });

  it('should enable update button when email is entered', () => {
    render(<AccountSettings />);
    const emailInput = screen.getByPlaceholderText('novo@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const updateButton = screen.getByRole('button', { name: /atualizar/i });
    expect(updateButton).not.toBeDisabled();
  });

  it('should open delete modal when delete button is clicked', () => {
    render(<AccountSettings />);
    const deleteButton = screen.getByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButton);
    // Modal should open - check for dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should open export modal when export button is clicked', () => {
    render(<AccountSettings />);
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    fireEvent.click(exportButton);
    // Modal should open - check for dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
