/**
 * Tự động: start API -> đợi sẵn sàng -> chạy k6 -> tắt API.
 * Chạy: node scripts/run-k6-with-api.cjs hoặc pnpm test:k6:with-api
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

function checkApiEnv() {
  const apiDir = path.join(__dirname, '..', 'apps', 'api');
  const envPath = path.join(apiDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('[k6] Thiếu file apps/api/.env. Tạo file .env trong apps/api và thêm DB_USERNAME, DB_PASSWORD (user/mật khẩu PostgreSQL).');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const hasUser = /^\s*DB_USERNAME\s*=/m.test(content);
  const hasPass = /^\s*DB_PASSWORD\s*=/m.test(content);
  if (!hasUser || !hasPass) {
    console.error('[k6] Trong apps/api/.env cần có: DB_USERNAME=... và DB_PASSWORD=... (user/mật khẩu PostgreSQL).');
    process.exit(1);
  }
}
const CHECK_URL = `${BASE_URL}/car-catalog/brands`;
const MAX_WAIT_MS = 90 * 1000; // 90 giây
const POLL_MS = 800;

function waitForApi() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function tryRequest() {
      if (Date.now() - start > MAX_WAIT_MS) {
        reject(new Error('Timeout: API không phản hồi sau ' + MAX_WAIT_MS / 1000 + 's. Kiểm tra DB/env trong terminal API.'));
        return;
      }
      const req = http.get(CHECK_URL, (res) => {
        if (res.statusCode === 200) resolve();
        else tryAgain();
      });
      req.on('error', tryAgain);

      function tryAgain() {
        setTimeout(tryRequest, POLL_MS);
      }
    }
    tryRequest();
  });
}

function killProcess(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      try {
        process.kill(-proc.pid, 'SIGTERM');
      } catch (_) {
        process.kill(proc.pid, 'SIGTERM');
      }
    }
  } catch (_) {}
}

async function main() {
  checkApiEnv();
  const rootDir = path.resolve(__dirname, '..');
  const apiDir = path.join(rootDir, 'apps', 'api');
  const apiProc = spawn('pnpm', ['run', 'dev'], {
    cwd: apiDir,
    stdio: 'inherit',
    shell: true,
    detached: process.platform !== 'win32',
    env: { ...process.env, FAST_START: '1' },
  });

  if (apiProc.unref) apiProc.unref();

  console.log('[k6] Đang đợi API tại', CHECK_URL, '...');
  try {
    await waitForApi();
  } catch (err) {
    console.error('[k6]', err.message);
    killProcess(apiProc);
    process.exit(1);
  }
  const scriptName = process.argv[2] || 'api-load.js';
  const scriptPath = path.join('k6', scriptName);
  console.log('[k6] API sẵn sàng. Chạy', scriptName, '...\n');

  let k6Exit = 0;
  try {
    execSync(`k6 run ${scriptPath}`, { cwd: rootDir, stdio: 'inherit' });
  } catch (e) {
    k6Exit = e.status ?? 1;
  }

  killProcess(apiProc);
  process.exit(k6Exit);
}

main();
