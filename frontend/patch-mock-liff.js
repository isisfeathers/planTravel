const fs = require('fs');
const file = 'frontend/src/stores/useAuthStore.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
    set({ status: 'initializing', error: null });

    // ==== MOCK LIFF FOR DEVELOPMENT ====
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      console.log('MOCK LIFF IS ENABLED!');
      set({ 
        isInClient: false, 
        status: 'authenticated', 
        user: { id: 'mock-user-id', line_user_id: 'mock-line-id', display_name: 'Mock User', active_itinerary_id: null } 
      });
      return;
    }
    // ====================================

    if (!LIFF_ID) {
`;

content = content.replace("    set({ status: 'initializing', error: null });\n\n    if (!LIFF_ID) {", replacement);
fs.writeFileSync(file, content);
console.log('Patched useAuthStore.ts');
