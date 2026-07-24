import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportDataModal } from '@/components/user/export-data-modal';

// Mock useExportData
vi.mock('@/hooks/api/use-user', () => ({
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

describe('ExportDataModal', () => {
  it('should render when open', () => {
    render(<ExportDataModal open={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Exportar Dados/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ExportDataModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show data sections list', () => {
    render(<ExportDataModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Perfil pessoal/)).toBeInTheDocument();
    expect(screen.getByText(/Transações financeiras/)).toBeInTheDocument();
    expect(screen.getByText(/Viagens e roteiros/)).toBeInTheDocument();
  });

  it('should have download button', () => {
    render(<ExportDataModal open={true} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /baixar dados/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<ExportDataModal open={true} onClose={onClose} />);
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should show sensitive data warning', () => {
    render(<ExportDataModal open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/sensíveis/)).toBeInTheDocument();
  });
});
