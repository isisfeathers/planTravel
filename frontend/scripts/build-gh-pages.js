const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendDir = path.resolve(__dirname, '..');
const apiDir = path.join(frontendDir, 'src', 'app', 'api');
const apiBackupDir = path.join(frontendDir, 'src', 'app', '_api_backup');
const outDir = path.join(frontendDir, 'out');

console.log('🚀 開始為 GitHub Pages 進行純靜態打包 (Static HTML Export)...');

let apiMoved = false;

try {
  // 1. 若存在 API 目錄，暫時備份以進行純靜態匯出
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, apiBackupDir);
    apiMoved = true;
    console.log('📦 已暫存伺服端 API 路由');
  }

  // 2. 執行 Next.js static build
  console.log('🔨 正在執行 next build (output: export)...');
  execSync('npx next build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      DEPLOY_TARGET: 'gh-pages',
      NEXT_PUBLIC_MOCK_LIFF: 'false',
      NEXT_PUBLIC_LIFF_ID: '2011659983-aQFWuWxE',
      NEXT_PUBLIC_SUPABASE_URL: 'https://fvnxaksfcftatvxddhpx.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bnhha3NmY2Z0YXR2eGRkaHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzI5OTgsImV4cCI6MjEwNTEwODk5OH0.WaYAvOxh6jevcZew5QgwR1ZFP97i7MqyfheZTdR4Dkg',
      NEXT_PUBLIC_FLIGHT_SERVICE_URL: 'https://atrip-flight-service-1096361179847.asia-east1.run.app',
      FLIGHT_SERVICE_URL: 'https://atrip-flight-service-1096361179847.asia-east1.run.app',
    },
  });

  // 3. 建立 GitHub Pages 必備的 .nojekyll 檔案 (防止 _next 目錄被 Jekyll 忽略)
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  console.log('✅ 已建立 .nojekyll');

  // 4. 建立 404.html (若使用者在子頁面重新整理，GitHub Pages 會回退至 404.html)
  const notFoundHtml = path.join(outDir, '_not-found', 'index.html');
  const fallback404 = path.join(outDir, '404.html');
  if (fs.existsSync(notFoundHtml)) {
    fs.copyFileSync(notFoundHtml, fallback404);
  } else if (fs.existsSync(path.join(outDir, 'index.html'))) {
    fs.copyFileSync(path.join(outDir, 'index.html'), fallback404);
  }
  console.log('✅ 已配置 GitHub Pages SPA 404 轉發路由');

  // 5. 壓縮產物包至專案根目錄
  const zipPath = path.resolve(frontendDir, '..', 'github-pages-dist.zip');
  execSync(`cd "${outDir}" && zip -r "${zipPath}" .`, { stdio: 'ignore' });
  console.log(`🎉 打包完成！靜態產出物已放置於: ${outDir}`);
  console.log(`📦 已生成一鍵發布壓縮包: ${zipPath}`);

} catch (err) {
  console.error('❌ 打包過程發生錯誤:', err);
  process.exit(1);
} finally {
  // 還原 API 目錄
  if (apiMoved && fs.existsSync(apiBackupDir)) {
    fs.renameSync(apiBackupDir, apiDir);
    console.log('🔄 已還原伺服端 API 路由');
  }
}
