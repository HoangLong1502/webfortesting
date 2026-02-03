/**
 * k6 CAPACITY test - Xác định số user (VUs) tối đa hệ thống chịu được mà vẫn OK.
 * Tăng từng bậc VUs, mỗi bậc giữ 2 phút; threshold nghiêm (p95 < 2s, error < 5%).
 * Khi vượt threshold → capacity nằm ở bậc trước đó.
 *
 * Chạy: k6 run k6/api-capacity.js
 * Hoặc: pnpm test:k6:capacity
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '2m', target: 30 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 70 },
    { duration: '2m', target: 70 },
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
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
  sleep(0.3 + Math.random() * 0.7);
}
