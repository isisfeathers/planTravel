const fs = require('fs');
const file = 'frontend/src/stores/useAuthStore.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
  login: async () => {
    if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'mock@atrip.app',
        password: '123456',
      });
      if (!error && data.user) {
        set({ 
          isInClient: false, 
          status: 'authenticated', 
          user: { 
            id: data.user.id, 
            line_user_id: 'mock-line-id', 
            display_name: 'Mock User', 
            active_itinerary_id: null 
          } 
        });
      }
      return;
    }

    if (!liff.isLoggedIn()) {
      liff.login();
    }
  },
`;

content = content.replace(/  login: \(\) => \{\s+if \(!liff\.isLoggedIn\(\)\) \{\s+liff\.login\(\);\s+\}\s+\},/, replacement);

fs.writeFileSync(file, content);
console.log('Patched login function in useAuthStore.ts');
