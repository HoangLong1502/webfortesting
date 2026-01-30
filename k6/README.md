# k6 Load Testing

Dự án dùng [k6](https://grafana.com/docs/k6/latest/) (Grafana) để load test API.

## Cách dễ nhất (một lệnh)

**Chỉ cần cài k6** (xem mục "Cài đặt k6" bên dưới), rồi chạy:

```bash
pnpm test:k6:with-api
```

Script sẽ **tự động**: khởi động API → đợi API sẵn sàng (tối đa 90s) → chạy load test k6 → tắt API. Không cần mở hai terminal hay bật API tay.

**Lỗi thường gặp:**
- `'k6' is not recognized` → Chưa cài k6. Cài theo mục dưới rồi chạy `pnpm test:k6`.
- `docker daemon is not running` / `cannot find the file specified` → Docker Desktop chưa chạy: **mở Docker Desktop** rồi chạy lại `pnpm test:k6:docker`. Nếu không dùng Docker thì cài k6 (cách 1 bên dưới).
- `connection refused` / `http_req_failed 100%` → **API chưa chạy.** Phải khởi động API trước (port 8000), sau đó mới chạy load test.

## Cài đặt k6 (bắt buộc)

k6 là công cụ chạy bằng binary, **không** có qua npm. Chọn một cách:

- **Windows**
  - Cách 1 (dễ): Tải file cài [k6 Windows .msi](https://github.com/grafana/k6/releases) → cài xong mở lại terminal.
  - Cách 2 (scoop): `scoop install k6`
  - Cách 3 (Chocolatey): `choco install k6`
- **macOS:** `brew install k6`
- **Linux:** [Install k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

Kiểm tra đã cài: `k6 version`

**Nếu dùng Docker:** cần cài và **mở Docker Desktop**, sau đó chạy `pnpm test:k6:docker` (API phải đang chạy ở localhost:8000).

## Chạy test (cách thủ công)

Nếu không dùng `pnpm test:k6:with-api`, có thể:

**Bước 1 – Bật API** (terminal 1): `pnpm --filter api dev`  
**Bước 2 – Chạy k6** (terminal 2): `pnpm test:k6`

Hoặc gọi k6 trực tiếp:

```bash
k6 run k6/api-load.js
```

Đổi base URL:

```bash
BASE_URL=https://api.example.com k6 run k6/api-load.js
# hoặc
pnpm test:k6 -- -e BASE_URL=https://api.example.com
```

## Bốn loại test

| Loại | Mục đích | Lệnh (API đang chạy) | Lệnh (tự start API) |
|------|----------|----------------------|---------------------|
| **Load** | Tải bình thường, kiểm tra hiệu năng cơ bản | `pnpm test:k6` | `pnpm test:k6:with-api` |
| **Stress** | Tăng dần VUs (→100) để tìm điểm gãy | `pnpm test:k6:stress` | `pnpm test:k6:stress:with-api` |
| **Spike** | Đột ngột tăng vọt tải rồi giảm (flash sale) | `pnpm test:k6:spike` | `pnpm test:k6:spike:with-api` |
| **Soak** | Tải ổn định ~10 phút, tìm rò rỉ bộ nhớ | `pnpm test:k6:soak` | `pnpm test:k6:soak:with-api` |

- **Load:** 10 VUs × 30s, p(95) &lt; 2s.
- **Stress:** stages 0→20→50→80→100 VUs (~8 phút), cho phép p(95)&lt;5s, &lt;20% lỗi.
- **Spike:** 5 VUs → spike 80 VUs trong 10s → giữ 1 phút → giảm về 5.
- **Soak:** 20 VUs × 10 phút (có thể tăng `duration` trong `k6/api-soak.js`).

Chạy với API tự khởi động: `node scripts/run-k6-with-api.cjs api-stress.js` (đổi tên file tùy loại test).

## Cấu trúc

- `k6/api-load.js` – **Load test**: 10 VUs, 30s.
- `k6/api-stress.js` – **Stress test**: ramp VUs lên 100.
- `k6/api-spike.js` – **Spike test**: tải thấp → spike cao → thấp lại.
- `k6/api-soak.js` – **Soak test**: 20 VUs, 10 phút.

Các script đều gọi các endpoint **thực tế**:
- **Bài đăng:** `GET /posts/car`, `/posts/bike`, `/posts/battery`
- **Catalog:** `GET /car-catalog/brands`, `/bike-catalog/brands`, `/battery-catalog/brands`
- **Tìm kiếm:** `GET /posts/search?q=pin`
