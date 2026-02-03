
## Bốn loại test

| Loại | Mục đích | Lệnh (API đang chạy) | Lệnh (tự start API) |
|------|----------|----------------------|---------------------|
| **Load** | Tải bình thường, kiểm tra hiệu năng cơ bản | `pnpm test:k6` | `pnpm test:k6:with-api` |
| **Stress** | Tăng dần VUs (→100) để tìm điểm gãy | `pnpm test:k6:stress` | `pnpm test:k6:stress:with-api` |
| **Spike** | Đột ngột tăng vọt tải rồi giảm (flash sale) | `pnpm test:k6:spike` | `pnpm test:k6:spike:with-api` |
| **Soak** | Tải ổn định ~10 phút, tìm rò rỉ bộ nhớ | `pnpm test:k6:soak` | `pnpm test:k6:soak:with-api` |
| **Break** | Đẩy VUs lên cao (→200) để tìm điểm gãy | `pnpm test:k6:break` | `pnpm test:k6:break:with-api` |
| **Capacity** | Tăng từng bậc VUs, xác định số user tối đa còn OK | `pnpm test:k6:capacity` | `pnpm test:k6:capacity:with-api` |

- **Load:** 10 VUs × 30s, p(95) &lt; 2s.
- **Stress:** stages 0→20→50→80→100 VUs (~8 phút), cho phép p(95)&lt;5s, &lt;20% lỗi.
- **Spike:** 5 VUs → spike 80 VUs trong 10s → giữ 1 phút → giảm về 5.
- **Soak:** 20 VUs × 10 phút (có thể tăng `duration` trong `k6/api-soak.js`).
- **Break:** ramp 20→50→80→120→150→200 VUs, threshold lỏng để ghi nhận breakpoint.
- **Capacity:** bậc 10→30→50→70→100 VUs, mỗi bậc 2 phút; p(95)&lt;2s, &lt;5% lỗi.

**Lệnh tự start API rồi chạy k6 (copy nhanh):**
- `pnpm test:k6:with-api` — Load
- `pnpm test:k6:stress:with-api` — Stress
- `pnpm test:k6:spike:with-api` — Spike
- `pnpm test:k6:soak:with-api` — Soak
- `pnpm test:k6:break:with-api` — Break
- `pnpm test:k6:capacity:with-api` — Capacity

Hoặc: `node scripts/run-k6-with-api.cjs <tên-file.js>` (vd: `api-stress.js`, `api-break.js`).

## Lỗi "connection refused" / "target machine actively refused it"

Nếu k6 báo **100% request failed** với lỗi `connectex: No connection could be made because the target machine actively refused it` → **API chưa chạy** trên port 8000.

- **Cách 1:** Mở terminal khác, chạy API trước: `pnpm --filter api dev` (từ root) hoặc `cd apps/api && pnpm dev`. Đợi API lên rồi chạy `pnpm test:k6` (hoặc test khác).
- **Cách 2:** Dùng lệnh có `:with-api` để script tự start API rồi chạy k6: `pnpm test:k6:with-api`, `pnpm test:k6:break:with-api`, v.v. (cần có `apps/api/.env` với DB_USERNAME, DB_PASSWORD).

## API start nhanh hơn

- **Dev:** API đã giảm retry DB (2 lần, 1s) và timeout 10s thay vì 60s → kết nối nhanh hơn hoặc fail nhanh.
- **Chạy k6 kèm API:** `pnpm test:k6:with-api` tự bật `FAST_START=1` → API không load Swagger, start nhanh hơn.
- **Chạy API thủ công nhanh:** trong `apps/api` chạy với `FAST_START=1` (PowerShell: `$env:FAST_START='1'; pnpm dev`; CMD: `set FAST_START=1&& pnpm dev`). Swagger sẽ tắt; dùng khi chỉ cần test/k6.

## Cấu trúc

- `k6/api-load.js` – **Load test**: 10 VUs, 30s.
- `k6/api-stress.js` – **Stress test**: ramp VUs lên 100.
- `k6/api-spike.js` – **Spike test**: tải thấp → spike cao → thấp lại.
- `k6/api-soak.js` – **Soak test**: 20 VUs, 10 phút.
- `k6/api-break.js` – **Break test**: ramp VUs lên 200 để tìm điểm gãy.
- `k6/api-capacity.js` – **Capacity test**: từng bậc VUs để xác định số user tối đa còn OK.

Các script đều gọi các endpoint **thực tế**:
- **Bài đăng:** `GET /posts/car`, `/posts/bike`, `/posts/battery`
- **Catalog:** `GET /car-catalog/brands`, `/bike-catalog/brands`, `/battery-catalog/brands`
- **Tìm kiếm:** `GET /posts/search?q=pin`
🔹 Các loại test khác có thể làm với k6
