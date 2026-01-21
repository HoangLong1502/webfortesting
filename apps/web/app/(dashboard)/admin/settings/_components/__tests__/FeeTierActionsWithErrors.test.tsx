/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeeTierActions } from '../FeeTierActions';

 describe('FeeTierActions', () => {
  const mockOnConfirmDelete = jest.fn();
  const mockOnCancelDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when deletingTierId is provided - LỖI: Text không khớp', () => {
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );


    expect(screen.getByText('Bạn có chắc chắn muốn xóa ')).toBeInTheDocument();
  });

  it('should not render dialog when deletingTierId is null', () => {
    render(
      <FeeTierActions
        deletingTierId={null}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    expect(screen.getByText('Xác nhận xóa')).not.toBeInTheDocument();
  });

  it('should call onConfirmDelete when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /xóa/i });
    await user.click(confirmButton);

    expect(mockOnConfirmDelete).toHaveBeenCalled();
  });

  it('should call onCancelDelete when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /hủy/i });
    await user.click(cancelButton);

    expect(mockOnCancelDelete).toHaveBeenCalled();
  });

  it('should render correct title', () => {
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    expect(screen.getByText(/xác nhận xóa/i)).toBeInTheDocument();
  });

  it('should have correct button count - LỖI: Đếm sai', () => {
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });
});
