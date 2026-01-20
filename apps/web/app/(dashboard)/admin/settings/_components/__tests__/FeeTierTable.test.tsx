/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeeTierTable } from '../FeeTierTable';
import type { FeeTier } from '@/types/api/fee-tier';

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button data-testid="button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <span data-testid="badge" className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/lib/utils/format', () => ({
  formatCurrency: (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  },
}));

describe('FeeTierTable', () => {
  const mockFeeTiers: FeeTier[] = [
    {
      id: 1,
      minPrice: '1000000',
      maxPrice: '5000000',
      depositRate: '0.1',
      active: true,
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      minPrice: '5000000',
      maxPrice: '10000000',
      depositRate: '0.15',
      active: false,
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      minPrice: '10000000',
      maxPrice: null,
      depositRate: '0.2',
      active: true,
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockOnAddTier = jest.fn();
  const mockOnEditTier = jest.fn();
  const mockOnDeleteTier = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table with fee tiers', () => {
    render(
      <FeeTierTable
        feeTiers={mockFeeTiers}
        onAddTier={mockOnAddTier}
        onEditTier={mockOnEditTier}
        onDeleteTier={mockOnDeleteTier}
      />
    );

    expect(screen.getByText('Hoa Hồng')).toBeInTheDocument();
    expect(screen.getByText('Thêm Hoa Hồng')).toBeInTheDocument();
  });

  it('should call onAddTier when add button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <FeeTierTable
        feeTiers={mockFeeTiers}
        onAddTier={mockOnAddTier}
        onEditTier={mockOnEditTier}
        onDeleteTier={mockOnDeleteTier}
      />
    );

    const addButton = screen.getByText('Thêm Hoa Hồng');
    await user.click(addButton);

    expect(mockOnAddTier).toHaveBeenCalledTimes(1);
  });

  it('should display empty message when no fee tiers', () => {
    render(
      <FeeTierTable
        feeTiers={[]}
        onAddTier={mockOnAddTier}
        onEditTier={mockOnEditTier}
        onDeleteTier={mockOnDeleteTier}
      />
    );

    expect(screen.getByText(/Chưa có hoa hồng nào/)).toBeInTheDocument();
  });

  it('should render sortable columns', () => {
    render(
      <FeeTierTable
        feeTiers={mockFeeTiers}
        onAddTier={mockOnAddTier}
        onEditTier={mockOnEditTier}
        onDeleteTier={mockOnDeleteTier}
      />
    );

    expect(screen.getByText('Giá Tối Thiểu')).toBeInTheDocument();
    expect(screen.getByText('Giá Tối Đa')).toBeInTheDocument();
    expect(screen.getByText('Phí Hoa Hồng')).toBeInTheDocument();
  });
});
