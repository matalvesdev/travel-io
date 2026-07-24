import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from '@/components/user/user-avatar';

describe('UserAvatar', () => {
  it('should render image when src is provided', () => {
    render(<UserAvatar src="https://example.com/avatar.jpg" name="John Doe" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('should render initials when no src is provided', () => {
    render(<UserAvatar src={null} name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render initials when src is undefined', () => {
    render(<UserAvatar src={undefined} name="Maria Silva" />);
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('should render first two initials for multi-word names', () => {
    render(<UserAvatar src={null} name="John Michael Doe" />);
    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('should apply sm size class', () => {
    const { container } = render(<UserAvatar src={null} name="John" size="sm" />);
    expect(container.firstChild).toHaveClass('h-8', 'w-8');
  });

  it('should apply md size class by default', () => {
    const { container } = render(<UserAvatar src={null} name="John" />);
    expect(container.firstChild).toHaveClass('h-10', 'w-10');
  });

  it('should apply lg size class', () => {
    const { container } = render(<UserAvatar src={null} name="John" size="lg" />);
    expect(container.firstChild).toHaveClass('h-16', 'w-16');
  });
});
