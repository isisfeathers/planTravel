const fs = require('fs');
const file = 'frontend/src/components/wizard/WizardHeadlessForm.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw new Error("請先完成 LINE／Supabase 登入再建立行程。");
      }
      const userId = data.user.id;

      const created = await createItinerary(supabase, {
        userId: userId,
`;

// 恢復原本 Wizard 拿真實 User 的寫法
content = content.replace(/      let userId = "11111111-1111-1111-1111-111111111111"; \/\/ Mock ID 預設值\s+const supabase = getSupabaseBrowserClient\(\);\s+\/\/ 如果不是 MOCK 模式才去拿真正的 auth\.getUser\s+if \(process\.env\.NEXT_PUBLIC_MOCK_LIFF !== 'true'\) \{\s+const \{ data, error \} = await supabase\.auth\.getUser\(\);\s+if \(error \|\| !data\.user\) \{\s+throw new Error\("請先完成 LINE／Supabase 登入再建立行程。"\);\s+\}\s+userId = data\.user\.id;\s+\}\s+const created = await createItinerary\(supabase, \{\s+userId: userId,/s, replacement);

fs.writeFileSync(file, content);
console.log('Restored WizardHeadlessForm.tsx to original');
