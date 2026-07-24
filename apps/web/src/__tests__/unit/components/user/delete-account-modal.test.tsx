import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteAccountModal } from '@/components/user/delete-account-modal';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useDeleteAccount
vi.mock('@/hooks/api/use-user', () => ({
  useDeleteAccount: () => ({
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

describe('DeleteAccountModal', () => {
  it('should render when open', () => {
    render(<DeleteAccountModal open={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/irreversível/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<DeleteAccountModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show warning list items', () => {
    render(<DeleteAccountModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/conta será desativada/)).toBeInTheDocument();
    expect(screen.getByText(/recuperar a conta/)).toBeInTheDocument();
  });

  it('should have password input', () => {
    render(<DeleteAccountModal open={true} onClose={vi.fn()} />);
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
  });

  it('should disable confirm button when password is empty', () => {
    render(<DeleteAccountModal open={true} onClose={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find((b) => b.textContent?.includes('Excluir'));
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when password is entered', () => {
    render(<DeleteAccountModal open={true} onClose={vi.fn()} />);
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find((b) => b.textContent?.includes('Excluir'));
    expect(confirmButton).not.toBeDisabled();
  });

  it('should call onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<DeleteAccountModal open={true} onClose={onClose} />);
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
});
