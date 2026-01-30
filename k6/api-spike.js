/**
 * k6 SPIKE test - Tải bình thường rồi đột ngột tăng vọt, rồi giảm.
 * Kiểm tra hệ thống có chịu được spike (sự kiện hot, flash sale...).
 *
 * Chạy: k6 run k6/api-spike.js
 * Hoặc: pnpm test:k6:spike
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // tải bình thường
    { duration: '10s', target: 80 }, // spike: 5 → 80 trong 10s
    { duration: '1m', target: 80 },  // giữ spike
    { duration: '10s', target: 5 },   // giảm nhanh
    { duration: '30s', target: 5 },   // ổn định lại
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<4000'],
    http_req_failed: ['rate<0.15'],
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
  sleep(0.2 + Math.random() * 0.6);
}
