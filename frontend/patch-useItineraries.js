const fs = require('fs');
const file = 'frontend/src/hooks/useItineraries.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      // 攔截沒有查到 Profile 的錯誤 (特別是假帳號時)，不要拋出例外中斷畫面
      if (profileRes.error && profileRes.error.code !== 'PGRST116') {
        console.error('Profile 查詢失敗:', profileRes.error);
        throw new Error(\`Profile 查詢失敗: \${profileRes.error.message}\`);
      }
      if (itinerariesRes.error) {
        throw new Error(\`行程列表查詢失敗: \${itinerariesRes.error.message}\`);
      }
`;

content = content.replace("      if (profileRes.error) {\n        throw new Error(`Profile 查詢失敗: ${profileRes.error.message}`);\n      }\n      if (itinerariesRes.error) {\n        throw new Error(`行程列表查詢失敗: ${itinerariesRes.error.message}`);\n      }", replacement);
fs.writeFileSync(file, content);
console.log('Patched useItineraries.ts');
