const fs = require('fs');
const file = 'frontend/src/hooks/useItineraries.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      // 攔截沒有查到 Profile 的錯誤 (特別是假帳號時)，不要拋出例外中斷畫面
      if (profileRes.error) {
        // 如果是 PGRST116 (查無資料)，我們就給它一個預設值 null，不要 throw Error
        if (profileRes.error.code === 'PGRST116' || profileRes.error.message.includes('single JSON object')) {
          console.warn('查無 Profile，將活躍行程設為 null (可能是假用戶)');
        } else {
          throw new Error(\`Profile 查詢失敗: \${profileRes.error.message}\`);
        }
      }
      if (itinerariesRes.error) {
        throw new Error(\`行程列表查詢失敗: \${itinerariesRes.error.message}\`);
      }
`;

// 把上一次的 patch 替換成更暴力的字串比對
const oldPatch = `
      // 攔截沒有查到 Profile 的錯誤 (特別是假帳號時)，不要拋出例外中斷畫面
      if (profileRes.error && profileRes.error.code !== 'PGRST116') {
        console.error('Profile 查詢失敗:', profileRes.error);
        throw new Error(\`Profile 查詢失敗: \${profileRes.error.message}\`);
      }
      if (itinerariesRes.error) {
        throw new Error(\`行程列表查詢失敗: \${itinerariesRes.error.message}\`);
      }
`;

content = content.replace(oldPatch, replacement);
fs.writeFileSync(file, content);
console.log('Patched useItineraries.ts (v2)');
