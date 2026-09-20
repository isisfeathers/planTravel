const fs = require('fs');
const file = 'frontend/src/components/wizard/WizardHeadlessForm.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      // ==== MOCK LIFF FOR DEVELOPMENT ====
      if (process.env.NEXT_PUBLIC_MOCK_LIFF === 'true') {
        console.log("Mock Mode: Skipping Supabase Create...");
        router.push(\`/waiting/mock-new-trip-\${Date.now()}\`);
        return;
      }
      // ===================================

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw new Error("請先完成 LINE／Supabase 登入再建立行程。");
      }
      const userId = data.user.id;

      const created = await createItinerary(supabase, {
        userId: userId,
`;

// 找到原本的送出邏輯並加上攔截
content = content.replace(/      const supabase = getSupabaseBrowserClient\(\);\s+const \{ data, error \} = await supabase\.auth\.getUser\(\);\s+if \(error \|\| !data\.user\) \{\s+throw new Error\("請先完成 LINE／Supabase 登入再建立行程。"\);\s+\}\s+const userId = data\.user\.id;\s+const created = await createItinerary\(supabase, \{\s+userId: userId,/s, replacement);

fs.writeFileSync(file, content);
console.log('Patched WizardHeadlessForm.tsx with full Mock bypass');
