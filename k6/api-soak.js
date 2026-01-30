/**
 * k6 SOAK (endurance) test - Tải ổn định kéo dài để tìm rò rỉ bộ nhớ / thoái lui hiệu năng.
 * 20 VUs chạy 10 phút (có thể tăng duration nếu cần).
 *
 * Chạy: k6 run k6/api-soak.js
 * Hoặc: pnpm test:k6:soak
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // ramp lên 20 VUs
    { duration: '10m', target: 20 },  // giữ 20 VUs trong 10 phút
    { duration: '1m', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

const endpoints = [
  { name: 'posts/car', url: `${BASE_URL}/posts/car?page=1&limit=20` },
  { name: 'posts/bike', url: `${BASE_URL}/posts/bike?page=1&limit=20` },
  { name: 'posts/battery', url: `${BASE_URL}/posts/battery?page=1&limit=20` },
  { name: 'car-catalog/brands', url: `${BASE_URL}/car-catalog/brands` },
  { name: 'bike-catalog/brands', url: `${BASE_URL}/bike-catalog/brands` },
  { name: 'battery-catalog/brands', url: `${BASE_URL}/battery-catalog/brands` },
  { name: 'posts/search', url: `${BASE_URL}/posts/search?q=pin` },
];

export default function () {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(endpoint.url);
  check(res, {
    [`${endpoint.name} status 200`]: (r) => r.status === 200,
  });
  sleep(0.5 + Math.random() * 1);
}
