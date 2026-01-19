# Hướng Dẫn Sử Dụng Jest để Test

Tài liệu này hướng dẫn cách sử dụng Jest để viết và chạy test trong dự án Next.js.

## 📋 Mục Lục

1. [Cài Đặt](#cài-đặt)
2. [Cấu Hình](#cấu-hình)
3. [Viết Test](#viết-test)
4. [Chạy Test](#chạy-test)
5. [Best Practices](#best-practices)
6. [Ví Dụ](#ví-dụ)

## 🚀 Cài Đặt

### Bước 1: Cài đặt dependencies

Chạy lệnh sau trong thư mục `apps/web`:

```bash
pnpm install
```

Các package đã được thêm vào `package.json`:
- `jest` - Framework testing
- `jest-environment-jsdom` - Môi trường test cho React components
- `@testing-library/react` - Utilities để test React components
- `@testing-library/jest-dom` - Custom matchers cho DOM
- `@testing-library/user-event` - Simulate user interactions
- `@types/jest` - TypeScript types cho Jest

## ⚙️ Cấu Hình

### File cấu hình

Dự án đã có các file cấu hình sau:

1. **`jest.config.js`** - Cấu hình chính của Jest
   - Sử dụng `next/jest` để tích hợp với Next.js
   - Hỗ trợ path aliases (`@/*`)
   - Cấu hình test environment là `jsdom`

2. **`jest.setup.js`** - File setup chạy trước mỗi test
   - Import `@testing-library/jest-dom` matchers
   - Mock Next.js router
   - Mock `window.matchMedia` và `IntersectionObserver`

## ✍️ Viết Test

### Cấu trúc file test

Đặt file test trong thư mục `__tests__` hoặc đặt tên file với suffix `.test.tsx` hoặc `.spec.tsx`.

**Ví dụ:**
```
components/
  MyComponent.tsx
  __tests__/
    MyComponent.test.tsx
```

hoặc

```
components/
  MyComponent.tsx
  MyComponent.test.tsx
```

### Cấu trúc test cơ bản

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Các API thường dùng

#### 1. Render component

```typescript
import { render } from '@testing-library/react';

render(<MyComponent prop1="value" />);
```

#### 2. Query elements

```typescript
import { screen } from '@testing-library/react';

// getBy* - Tìm element (throw error nếu không tìm thấy)
screen.getByText('Hello');
screen.getByRole('button');
screen.getByTestId('my-button');

// queryBy* - Tìm element (return null nếu không tìm thấy)
screen.queryByText('Hello');

// findBy* - Tìm element async (return Promise)
await screen.findByText('Hello');
```

#### 3. User interactions

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.clear(input);
```

#### 4. Assertions

```typescript
import '@testing-library/jest-dom';

expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('Hello');
expect(element).toHaveClass('active');
expect(element).toBeDisabled();
expect(element).toBeRequired();
expect(input).toHaveValue('value');
```

#### 5. Mock functions

```typescript
const mockFn = jest.fn();
const mockFnWithReturn = jest.fn(() => 'return value');

// Kiểm tra function đã được gọi
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(2);
```

#### 6. Mock modules

```typescript
// Mock một module
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: 'test' })),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}));
```

#### 7. Async testing

```typescript
import { waitFor } from '@testing-library/react';

// Đợi element xuất hiện
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Đợi function được gọi
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

## 🏃 Chạy Test

### Chạy tất cả test

```bash
pnpm test
```

### Chạy test với watch mode (tự động chạy lại khi file thay đổi)

```bash
pnpm test:watch
```

### Chạy test với coverage report

```bash
pnpm test:coverage
```

### Chạy test cho một file cụ thể

```bash
pnpm test FeeTierDialog.test.tsx
```

### Chạy test với pattern

```bash
pnpm test --testNamePattern="should render"
```

### Chạy test trong một thư mục

```bash
pnpm test __tests__
```

## 📚 Best Practices

### 1. Tổ chức test

- Nhóm các test liên quan bằng `describe`
- Đặt tên test rõ ràng, mô tả hành vi
- Sử dụng `beforeEach`, `afterEach` để setup/cleanup

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    // Setup trước mỗi test
  });

  describe('when user clicks button', () => {
    it('should call onSubmit', async () => {
      // Test code
    });
  });
});
```

### 2. Test user behavior, không test implementation

✅ **Tốt:**
```typescript
it('should submit form when user clicks submit button', async () => {
  const user = userEvent.setup();
  render(<Form />);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockOnSubmit).toHaveBeenCalled();
});
```

❌ **Không tốt:**
```typescript
it('should call onSubmit function', () => {
  const component = render(<Form />);
  component.instance().onSubmit();
  expect(mockOnSubmit).toHaveBeenCalled();
});
```

### 3. Sử dụng data-testid khi cần

```typescript
// Component
<button data-testid="submit-button">Submit</button>

// Test
screen.getByTestId('submit-button');
```

### 4. Cleanup mocks

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. Test edge cases

- Test với props null/undefined
- Test với empty data
- Test với error states
- Test với loading states

### 6. Mock external dependencies

```typescript
// Mock API calls
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(),
}));

// Mock Next.js features
jest.mock('next/navigation');
```

## 💡 Ví Dụ

### Ví dụ 1: Test component đơn giản

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Ví dụ 2: Test form với user interaction

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should submit form with email and password', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Ví dụ 3: Test với async data

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  })),
}));

describe('UserProfile', () => {
  it('should display user data after loading', async () => {
    render(<UserProfile userId={1} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});
```

### Ví dụ 4: Test với Next.js router

```typescript
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../Navigation';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
  }),
}));

describe('Navigation', () => {
  it('should navigate when clicking link', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    await user.click(screen.getByText('About'));
    expect(mockPush).toHaveBeenCalledWith('/about');
  });
});
```

## 🔍 Debugging Tests

### Xem HTML output

```typescript
import { screen } from '@testing-library/react';

// In ra HTML của component
screen.debug();

// In ra một element cụ thể
screen.debug(screen.getByRole('button'));
```

### Chạy test với verbose output

```bash
pnpm test --verbose
```

### Chạy test với no coverage

```bash
pnpm test --coverage=false
```

## 📖 Tài Liệu Tham Khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## ❓ FAQ

### Q: Làm sao test component sử dụng Next.js Image?

A: Mock component Image:

```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
```

### Q: Làm sao test component với React Query?

A: Wrap component với QueryClientProvider:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

render(
  <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
);
```

### Q: Làm sao test component với Context?

A: Wrap component với Context Provider:

```typescript
render(
  <MyContextProvider>
    <MyComponent />
  </MyContextProvider>
);
```

---

**Chúc bạn test vui vẻ! 🎉**
