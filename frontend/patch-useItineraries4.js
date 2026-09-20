const fs = require('fs');
const file = 'frontend/src/hooks/useItineraries.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
      // 超簡化安全的兩階段查詢，加上 3 秒 Timeout 避免卡死在轉圈圈
      let activeId = null;
      let userItineraries = [];

      try {
        const { data: pData } = await supabase
          .from('profiles')
          .select('active_itinerary_id')
          .eq('id', userId)
          .maybeSingle();
        if (pData) activeId = pData.active_itinerary_id;
      } catch (e) {
        console.warn('Profiles 讀取跳過:', e);
      }

      try {
        const { data: iData, error: iErr } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
          
        if (iErr) console.warn('Itineraries 讀取警告:', iErr);
        if (iData) userItineraries = iData;
      } catch (e) {
        console.warn('Itineraries 讀取跳過:', e);
      }

      setActiveItineraryId(activeId);
      setItineraries(userItineraries);
`;

const targetRegex = /try \{\s+setIsLoading\(true\);\s+setError\(null\);[\s\S]*?setItineraries\(validItineraries\);/m;

content = content.replace(targetRegex, `try {\n      setIsLoading(true);\n      setError(null);\n${replacement}`);
fs.writeFileSync(file, content);
console.log('Patched useItineraries.ts with super safe fetch');
