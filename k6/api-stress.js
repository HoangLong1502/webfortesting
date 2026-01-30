/**
 * k6 STRESS test - Đẩy API vượt ngưỡng bình thường để tìm điểm gãy.
 * Tăng dần VUs: 0 → 20 → 50 → 80 → 100, giữ 100 một lúc rồi dừng.
 *
 * Chạy: k6 run k6/api-stress.js
 * Hoặc: pnpm test:k6:stress
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '1m', target: 20 },  // ramp up
    { duration: '2m', target: 50 },
    { duration: '2m', target: 80 },
    { duration: '2m', target: 100 }, // giữ tải cao
    { duration: '1m', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // cho phép chậm hơn khi stress
    http_req_failed: ['rate<0.2'],     // cho phép tối đa 20% lỗi khi gần gãy
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
  sleep(0.2 + Math.random() * 0.5);
}
