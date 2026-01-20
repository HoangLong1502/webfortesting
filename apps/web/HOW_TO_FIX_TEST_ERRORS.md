# Hướng Dẫn Sửa Lỗi Test - FeeTierActionsWithErrors.test.tsx

## 🎯 Mục Đích

File test này **cố ý có lỗi** để bạn học cách:
1. Đọc và hiểu thông báo lỗi
2. Xác định nguyên nhân lỗi
3. Sửa lỗi đúng cách

## 📋 Chạy Test Để Xem Lỗi

```bash
cd apps/web
pnpm test FeeTierActionsWithErrors
```

## 🔍 Phân Tích Từng Lỗi

### ❌ Lỗi 1: Text không khớp

**Test code (SAI):**
```typescript
expect(screen.getByText('Bạn có chắc chắn muốn xóa?')).toBeInTheDocument();
```

**Error message:**
```
Unable to find an element with the text: Bạn có chắc chắn muốn xóa?
```

**Nguyên nhân:**
- Text trong component là: `"Bạn có chắc chắn muốn xóa hoa hồng này? Hành động này không thể hoàn tác."`
- Text trong test là: `"Bạn có chắc chắn muốn xóa?"` (thiếu phần sau)

**Cách sửa:**
```typescript
// ✅ Sửa 1: Dùng text đúng
expect(screen.getByText('Bạn có chắc chắn muốn xóa hoa hồng này? Hành động này không thể hoàn tác.')).toBeInTheDocument();

// ✅ Sửa 2: Dùng regex để match một phần
expect(screen.getByText(/Bạn có chắc chắn muốn xóa/i)).toBeInTheDocument();

// ✅ Sửa 3: Dùng textContent
const description = screen.getByText(/Bạn có chắc chắn/i);
expect(description.textContent).toContain('xóa hoa hồng này');
```

---

### ❌ Lỗi 2: Dùng getBy khi element có thể không tồn tại

**Test code (SAI):**
```typescript
expect(screen.getByText('Xác nhận xóa')).not.toBeInTheDocument();
```

**Error message:**
```
TestingLibraryElementError: Unable to find an element with the text: Xác nhận xóa
```

**Nguyên nhân:**
- `getByText()` sẽ **throw error** nếu không tìm thấy element
- Khi `deletingTierId` là `null`, dialog không render
- Nên dùng `queryByText()` thay vì `getByText()` khi element có thể không tồn tại

**Cách sửa:**
```typescript
// ✅ Sửa: Dùng queryBy thay vì getBy
const dialog = screen.queryByText('Xác nhận xóa');
expect(dialog).not.toBeInTheDocument();

// ✅ Hoặc kiểm tra dialog không render
expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
```

**Quy tắc:**
- `getBy*` → Dùng khi **chắc chắn** element tồn tại (throw error nếu không tìm thấy)
- `queryBy*` → Dùng khi element **có thể không tồn tại** (return null nếu không tìm thấy)
- `findBy*` → Dùng khi element **xuất hiện sau** (async, return Promise)

---

### ❌ Lỗi 3: Không đợi async operation

**Test code (SAI):**
```typescript
user.click(confirmButton);
expect(mockOnConfirmDelete).toHaveBeenCalled();
```

**Error message:**
```
expect(mockOnConfirmDelete).toHaveBeenCalled()
Expected number of calls: >= 1
Received number of calls:    0
```

**Nguyên nhân:**
- `user.click()` là **async operation** (trả về Promise)
- Test kiểm tra ngay lập tức, chưa đợi click hoàn thành
- Function chưa kịp được gọi

**Cách sửa:**
```typescript
// ✅ Sửa: Thêm await
await user.click(confirmButton);
expect(mockOnConfirmDelete).toHaveBeenCalled();

// ✅ Hoặc dùng waitFor nếu cần đợi lâu hơn
await user.click(confirmButton);
await waitFor(() => {
  expect(mockOnConfirmDelete).toHaveBeenCalled();
});
```

**Quy tắc:**
- Luôn dùng `await` với `userEvent` operations
- Luôn dùng `await` với `findBy*` queries
- Dùng `waitFor()` khi cần đợi điều kiện nào đó

---

### ❌ Lỗi 4: Tên button không đúng

**Test code (SAI):**
```typescript
const cancelButton = screen.getByRole('button', { name: /cancel/i });
```

**Error message:**
```
Unable to find an element with the role "button" and name "cancel"
```

**Nguyên nhân:**
- Button text trong component là: `"Hủy"` (tiếng Việt)
- Test tìm: `"cancel"` (tiếng Anh)
- Text không khớp

**Cách sửa:**
```typescript
// ✅ Sửa 1: Dùng text đúng
const cancelButton = screen.getByRole('button', { name: /hủy/i });

// ✅ Sửa 2: Dùng getAllByRole và tìm button thứ 2
const buttons = screen.getAllByRole('button');
const cancelButton = buttons[0]; // Button đầu tiên là "Hủy"

// ✅ Sửa 3: Tìm bằng text
const cancelButton = screen.getByText('Hủy');
```

**Tip:**
- Xem HTML output bằng `screen.debug()` để biết text chính xác
- Dùng regex `/hủy/i` để không phân biệt hoa thường

---

### ❌ Lỗi 5: Case sensitive hoặc text không khớp

**Test code (SAI):**
```typescript
expect(screen.getByText('Xác Nhận Xóa')).toBeInTheDocument();
```

**Error message:**
```
Unable to find an element with the text: Xác Nhận Xóa
```

**Nguyên nhân:**
- Text trong component là: `"Xác nhận xóa"` (chữ thường "nhận", "xóa")
- Test tìm: `"Xác Nhận Xóa"` (chữ hoa "Nhận", "Xóa")
- Case không khớp

**Cách sửa:**
```typescript
// ✅ Sửa 1: Dùng text đúng (case sensitive)
expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();

// ✅ Sửa 2: Dùng regex không phân biệt hoa thường
expect(screen.getByText(/xác nhận xóa/i)).toBeInTheDocument();

// ✅ Sửa 3: Tìm bằng role và accessible name
expect(screen.getByRole('heading', { name: /xác nhận xóa/i })).toBeInTheDocument();
```

**Tip:**
- Luôn dùng regex với flag `i` (case insensitive) để tránh lỗi case
- Hoặc copy text chính xác từ component

---

### ✅ Test Pass: Đếm button đúng

**Test code (ĐÚNG):**
```typescript
const buttons = screen.getAllByRole('button');
expect(buttons).toHaveLength(2);
```

**Giải thích:**
- Component có 2 buttons: "Hủy" và "Xóa"
- Test đếm đúng → Pass

---

## 📝 File Test Đã Sửa (Tham Khảo)

```typescript
/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeeTierActions } from '../FeeTierActions';

describe('FeeTierActions - Test đã sửa', () => {
  const mockOnConfirmDelete = jest.fn();
  const mockOnCancelDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when deletingTierId is provided', () => {
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    // ✅ Sửa: Dùng text đúng hoặc regex
    expect(screen.getByText(/Bạn có chắc chắn muốn xóa/i)).toBeInTheDocument();
    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();
  });

  it('should not render dialog when deletingTierId is null', () => {
    render(
      <FeeTierActions
        deletingTierId={null}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    // ✅ Sửa: Dùng queryBy thay vì getBy
    expect(screen.queryByText('Xác nhận xóa')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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

    // ✅ Sửa: Tìm button đúng và thêm await
    const confirmButton = screen.getByRole('button', { name: /xóa/i });
    await user.click(confirmButton);
    
    // ✅ Sửa: Kiểm tra sau khi click hoàn thành
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

    // ✅ Sửa: Dùng text đúng (tiếng Việt)
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

    // ✅ Sửa: Dùng text đúng hoặc regex case insensitive
    expect(screen.getByText(/xác nhận xóa/i)).toBeInTheDocument();
  });

  it('should have correct button count', () => {
    render(
      <FeeTierActions
        deletingTierId={1}
        onConfirmDelete={mockOnConfirmDelete}
        onCancelDelete={mockOnCancelDelete}
      />
    );

    // ✅ Test này đã đúng
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });
});
```

## 🎯 Tóm Tắt Các Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| **Text không khớp** | Text trong test khác với component | Dùng text đúng hoặc regex |
| **getBy khi element không tồn tại** | getBy throw error nếu không tìm thấy | Dùng queryBy |
| **Không đợi async** | userEvent là async nhưng không await | Thêm await |
| **Tên button sai** | Text không khớp (ngôn ngữ, case) | Dùng text đúng hoặc regex |
| **Case sensitive** | Chữ hoa/thường không khớp | Dùng regex với flag `i` |

## 💡 Tips

1. **Đọc error message kỹ**: Cho biết chính xác vấn đề
2. **Xem HTML output**: Dùng `screen.debug()` để xem component render gì
3. **Dùng regex**: Tránh lỗi case sensitive và text không khớp
4. **Dùng queryBy**: Khi element có thể không tồn tại
5. **Luôn await**: Với userEvent và findBy*

## 🚀 Thực Hành

1. Chạy test để xem lỗi: `pnpm test FeeTierActionsWithErrors`
2. Đọc error message
3. Sửa từng lỗi theo hướng dẫn
4. Chạy lại test để xác nhận đã sửa đúng

---

**Lưu ý:** File test này chỉ để học, không nên commit vào code. Sau khi học xong, có thể xóa file này.
