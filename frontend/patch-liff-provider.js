const fs = require('fs');
const file = 'frontend/src/components/auth/LiffProvider.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
  // 在 MOCK 模式下，如果還沒登入，也顯示讀取中，而不是直接跳登入畫面
  if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true' && status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-background text-brand-text">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-text-muted">
            正在使用 Mock 帳號自動登入...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
`;

content = content.replace(
  "  if (status === 'unauthenticated') {",
  replacement
);
fs.writeFileSync(file, content);
console.log('Patched LiffProvider.tsx');
