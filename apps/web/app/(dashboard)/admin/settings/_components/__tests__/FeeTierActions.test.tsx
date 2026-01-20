/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeeTierActions } from '../FeeTierActions';

jest.mock('@/components/ui/confirmation-dialog', () => ({
  ConfirmationDialog: ({ title, description, confirmText, onConfirm, open, onOpenChange }: any) => {
    if (!open) return null;

    return (
      <div data-testid="confirmation-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <button data-testid="confirm-button" onClick={onConfirm}>
          {confirmText}
        </button>
        <button data-testid="cancel-button" onClick={() => onOpenChange(false)}>
          Hủy
        </button>
      </div>
    );
  },
}));

describe('FeeTierActions', () => {
  const mockOnConfirmDelete = jest.fn();
  const mockOnCancelDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render dialog when deletingTierId is null', () => {
    render(
      <FeeTierActions
        deletingTierId={null}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
  });

  it('should render dialog', () => {
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();
    expect(screen.getByText(/Bạn có chắc chắn muốn xóa hoa hồng này/)).toBeInTheDocument();
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

    const confirmButton = screen.getByTestId('confirm-button');
    await user.click(confirmButton);

    expect(mockOnConfirmDelete).toHaveBeenCalledTimes(1);
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

    const cancelButton = screen.getByTestId('cancel-button');
    await user.click(cancelButton);

    expect(mockOnCancelDelete).toHaveBeenCalledTimes(1);
  });
});
