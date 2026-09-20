const fs = require('fs');
const file = 'frontend/src/stores/useAuthStore.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("user: { id: 'mock-user-id'", "user: { id: '11111111-1111-1111-1111-111111111111'");
fs.writeFileSync(file, content);
console.log('Patched useAuthStore.ts with UUID');
