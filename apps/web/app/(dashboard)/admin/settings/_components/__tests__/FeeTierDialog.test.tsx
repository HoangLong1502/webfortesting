/**
 * Test file cho FeeTierDialog component
 *
 * Hướng dẫn chạy test:
 * - Chạy tất cả test: pnpm test
 * - Chạy test với watch mode: pnpm test:watch
 * - Chạy test với coverage: pnpm test:coverage
 */

/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeeTierDialog, type FeeTierFormData } from '../FeeTierDialog';
import type { FeeTier } from '@/types/api/fee-tier';

// Mock các UI components nếu cần
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogDescription: ({ children }: any) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: any) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant }: any) => (
    <button
      data-testid={variant === 'outline' ? 'cancel-button' : 'submit-button'}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, value, onChange, placeholder, required, type, ...props }: any) => (
    <input
      id={id}
      data-testid={`input-${id}`}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      type={type}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ id, checked, onCheckedChange }: any) => (
    <input
      id={id}
      data-testid={`switch-${id}`}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

describe('FeeTierDialog', () => {
  const mockOnSubmit = jest.fn();
  const mockOnOpenChange = jest.fn();

  const mockFeeTier: FeeTier = {
    id: 1,
    minPrice: '5000000',
    maxPrice: '10000000',
    depositRate: '0.1',
    active: true,
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Khi mở dialog để tạo mới', () => {
    it('nên hiển thị đúng title và description', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Thêm Hoa Hồng Mới');
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Tạo mới một mức hoa hồng với tỷ lệ phí theo khoảng giá'
      );
    });

    it('nên khởi tạo form với giá trị mặc định', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const minPriceInput = screen.getByTestId('input-minPrice');
      expect(minPriceInput).toHaveValue('1.000.000');

      const maxPriceInput = screen.getByTestId('input-maxPrice');
      expect(maxPriceInput).toHaveValue('');

      const depositRateInput = screen.getByTestId('input-depositRate');
      // depositRate có thể là '' hoặc null khi khởi tạo, kiểm tra cả hai trường hợp
      const value = depositRateInput.getAttribute('value');
      expect(value === '' || value === null).toBe(true);

      const activeSwitch = screen.getByTestId('switch-active');
      expect(activeSwitch).toBeChecked();
    });

    it('nên hiển thị button "Tạo Mới"', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Tạo Mới');
    });
  });

  describe('Khi mở dialog để chỉnh sửa', () => {
    it('nên hiển thị đúng title và description', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={mockFeeTier}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Chỉnh Sửa Hoa Hồng');
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Cập nhật thông tin hoa hồng'
      );
    });

    it('nên điền form với dữ liệu của tier đang chỉnh sửa', () => {
      const tierWithDepositRate: FeeTier = {
        ...mockFeeTier,
        depositRate: '0.1', // 10% (stored as string in API)
      };

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={tierWithDepositRate}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const minPriceInput = screen.getByTestId('input-minPrice');
      expect(minPriceInput).toHaveValue('5.000.000');

      const maxPriceInput = screen.getByTestId('input-maxPrice');
      expect(maxPriceInput).toHaveValue('10.000.000');

      const depositRateInput = screen.getByTestId('input-depositRate');
      expect(depositRateInput).toHaveValue(10);
    });

    it('nên hiển thị button "Cập Nhật"', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={mockFeeTier}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Cập Nhật');
    });
  });

  describe('Xử lý input', () => {
    it('nên format số với dấu chấm khi nhập giá tối thiểu', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const minPriceInput = screen.getByTestId('input-minPrice');
      await user.clear(minPriceInput);
      await user.type(minPriceInput, '5000000');

      expect(minPriceInput).toHaveValue('5.000.000');
    });

    it('nên format số với dấu chấm khi nhập giá tối đa', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const maxPriceInput = screen.getByTestId('input-maxPrice');
      await user.type(maxPriceInput, '10000000');

      expect(maxPriceInput).toHaveValue('10.000.000');
    });

    it('nên cho phép xóa giá tối đa', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={mockFeeTier}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const maxPriceInput = screen.getByTestId('input-maxPrice');
      await user.clear(maxPriceInput);

      expect(maxPriceInput).toHaveValue('');
    });

    it('nên cập nhật deposit rate khi nhập', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const depositRateInput = screen.getByTestId('input-depositRate');
      await user.type(depositRateInput, '15.5');

      expect(depositRateInput).toHaveValue(15.5);
    });

    it('nên toggle switch active', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const activeSwitch = screen.getByTestId('switch-active');
      expect(activeSwitch).toBeChecked();

      await user.click(activeSwitch);
      expect(activeSwitch).not.toBeChecked();

      await user.click(activeSwitch);
      expect(activeSwitch).toBeChecked();
    });
  });

  describe('Submit form', () => {
    it('nên gọi onSubmit với dữ liệu đúng khi submit form tạo mới', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const minPriceInput = screen.getByTestId('input-minPrice');
      const maxPriceInput = screen.getByTestId('input-maxPrice');
      const depositRateInput = screen.getByTestId('input-depositRate');

      await user.clear(minPriceInput);
      await user.type(minPriceInput, '5000000');
      await user.type(maxPriceInput, '10000000');
      await user.type(depositRateInput, '10');

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          minPrice: '5000000',
          maxPrice: '10000000',
          depositRate: '10',
          active: true,
        });
      });
    });

    it('nên disable submit button khi đang submitting', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={true}
        />
      );

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Đang lưu...');
    });

    it('nên gọi onOpenChange(false) khi click nút Hủy', async () => {
      const user = userEvent.setup();

      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Validation', () => {
    it('nên yêu cầu giá tối thiểu là bắt buộc', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const minPriceInput = screen.getByTestId('input-minPrice');
      expect(minPriceInput).toBeRequired();
    });

    it('nên yêu cầu deposit rate là bắt buộc', () => {
      render(
        <FeeTierDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          editingTier={null}
          onSubmit={mockOnSubmit}
          submitting={false}
        />
      );

      const depositRateInput = screen.getByTestId('input-depositRate');
      expect(depositRateInput).toBeRequired();
    });
  });
});
