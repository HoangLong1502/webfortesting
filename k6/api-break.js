/**
 * k6 BREAK test - Đẩy hệ thống vượt ngưỡng để tìm điểm gãy (breakpoint).
 * Tăng VUs liên tục (ramp mạnh) cho đến khi latency/error vượt ngưỡng chấp nhận.
 * Mục đích: biết hệ thống "gãy" ở khoảng bao nhiêu VUs.
 *
 * Chạy: k6 run k6/api-break.js
 * Hoặc: pnpm test:k6:break
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '15s', target: 200 },
    { duration: '20s', target: 500 },
    { duration: '25s', target: 1000 },
    { duration: '30s', target: 2000 },
    { duration: '45s', target: 3000 },
    { duration: '1m', target: 4000 },
    { duration: '20s', target: 0 },
  ],
  // Break test: threshold lỏng — test chạy đến khi >50% lỗi thì dừng (đã tìm thấy breakpoint)
  thresholds: {
    http_req_duration: ['p(95)<20000'],
    http_req_failed: ['rate<0.5'],
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
  sleep(0.01 + Math.random() * 0.04);
}
