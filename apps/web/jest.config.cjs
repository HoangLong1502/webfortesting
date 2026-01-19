const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Đường dẫn đến thư mục Next.js app
  dir: './',
});

// Cấu hình Jest tùy chỉnh
const customJestConfig = {
  // Môi trường test (jsdom cho React components)
  testEnvironment: 'jest-environment-jsdom',
  
  // Đường dẫn đến file setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapping (để hỗ trợ path aliases như @/*)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Các thư mục/file cần bỏ qua khi test
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  
  // Các pattern để tìm file test
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Thu thập coverage từ các file này
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Next.js tự động xử lý transform, không cần cấu hình thêm
};

// Tạo và export cấu hình
module.exports = createJestConfig(customJestConfig);
