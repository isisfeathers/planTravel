const fs = require('fs');
const file = 'frontend/src/hooks/useItineraries.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      if (profileRes.error) {
        if (profileRes.error.code === 'PGRST116' || profileRes.error.message.includes('single JSON object')) {
           // Do nothing, mock user
        } else {
           throw new Error(\`Profile 查詢失敗: \${profileRes.error.message}\`);
        }
      }
      if (itinerariesRes.error) {
        throw new Error(\`行程列表查詢失敗: \${itinerariesRes.error.message}\`);
      }
`;

content = content.replace(/      if \(profileRes\.error\) \{\s+throw new Error\(`Profile 查詢失敗: \$\{profileRes\.error\.message\}`\);\s+\}\s+if \(itinerariesRes\.error\) \{\s+throw new Error\(`行程列表查詢失敗: \$\{itinerariesRes\.error\.message\}`\);\s+\}/, replacement);
fs.writeFileSync(file, content);
console.log('Patched useItineraries.ts (v3)');
