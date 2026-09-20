const fs = require('fs');
const file = 'frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const currentUserId = 'mock-user-id';", 
  "const currentUserId = '11111111-1111-1111-1111-111111111111';"
);

fs.writeFileSync(file, content);
console.log('Patched dashboard page.tsx');
