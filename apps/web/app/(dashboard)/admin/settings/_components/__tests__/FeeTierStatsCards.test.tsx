/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { FeeTierStatsCards } from '../FeeTierStatsCards';
import type { FeeTier } from '@/types/api/fee-tier';

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 data-testid="card-title" className={className}>{children}</h3>
  ),
}));

describe('FeeTierStatsCards', () => {
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
      active: true,
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      minPrice: '10000000',
      maxPrice: null,
      depositRate: '0.2',
      active: false,
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('should render total count correctly', () => {
    render(<FeeTierStatsCards feeTiers={mockFeeTiers} />);

    expect(screen.getByText('Tổng Hoa Hồng')).toBeInTheDocument();
    expect(screen.getByText('Tổng số mức hoa hồng')).toBeInTheDocument();
  });

  it('should render active count correctly', () => {
    render(<FeeTierStatsCards feeTiers={mockFeeTiers} />);

    expect(screen.getByText('Hoa Hồng Hoạt Động')).toBeInTheDocument();
    expect(screen.getByText('Hoa hồng đang hoạt động')).toBeInTheDocument();
  });

  it('should render cards when no fee tiers', () => {
    render(<FeeTierStatsCards feeTiers={[]} />);

    expect(screen.getByText('Tổng Hoa Hồng')).toBeInTheDocument();
    expect(screen.getByText('Hoa Hồng Hoạt Động')).toBeInTheDocument();
  });

  it('should render with all active tiers', () => {
    const allActiveTiers: FeeTier[] = [
      { id: 1, minPrice: '1000000', maxPrice: '5000000', depositRate: '0.1', active: true, updatedAt: '2024-01-01T00:00:00Z' },
      { id: 2, minPrice: '5000000', maxPrice: '10000000', depositRate: '0.15', active: true, updatedAt: '2024-01-01T00:00:00Z' },
    ];

    render(<FeeTierStatsCards feeTiers={allActiveTiers} />);

    expect(screen.getByText('Tổng Hoa Hồng')).toBeInTheDocument();
    expect(screen.getByText('Hoa Hồng Hoạt Động')).toBeInTheDocument();
  });
});
