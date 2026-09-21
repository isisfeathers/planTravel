import { randomUUID } from "crypto";

const DESTINATION_HOTELS: Record<string, { name: string; type: string; rating: number; price_level: string; address: string; reason: string }> = {
  '東京': {
    name: 'THE GATE HOTEL 雷門 by HULIC',
    type: '設計型景觀飯店',
    rating: 4.6,
    price_level: '中價位（約 NT$ 4,200/晚）',
    address: '東京都台東区雷門2-16-11',
    reason: '頂樓露台直面晴空塔，距離淺草站步行僅 2 分鐘，交通極為便利，適合作為固定 Basecamp 基地。',
  },
  '大阪': {
    name: '大阪南海輝盛庭國際公寓 (Fraser Residence)',
    type: '高級公寓式飯店',
    rating: 4.7,
    price_level: '中高價位（約 NT$ 4,600/晚）',
    address: '大阪市浪速区難波中1-17-11',
    reason: '緊鄰南海難波站，關西機場特急直達，心齋橋與道頓堀步行可達，生活機能絕佳。',
  },
  '京都': {
    name: '京都世紀酒店 (Kyoto Century Hotel)',
    type: '典雅星級酒店',
    rating: 4.6,
    price_level: '中價位（約 NT$ 3,900/晚）',
    address: '京都市下京区東塩小路町680',
    reason: '距離京都車站中央口步行僅 2 分鐘，JR 與地鐵樞紐中心，方便暢遊清水寺、嵐山與金閣寺。',
  },
  '京都與大阪': {
    name: 'THE GATE HOTEL 雷門 / 大阪南海輝盛庭',
    type: '雙城交通樞紐飯店',
    rating: 4.6,
    price_level: '標準舒適（約 NT$ 4,200/晚）',
    address: '京阪雙城中心樞紐周邊',
    reason: '鄰近主要鐵道大站，往返京都古蹟與大阪商圈最省時。',
  },
  '沖繩': {
    name: '那霸歌町大和 ROYNET 飯店 (Daiwa Roynet)',
    type: '商務度假飯店',
    rating: 4.5,
    price_level: '實惠舒適（約 NT$ 2,900/晚）',
    address: '沖縄県那覇市おもろまち1-1-12',
    reason: '單軌電車歌町站直通，DFS 租車中心就在旁邊，購物與自駕出發極度方便。',
  },
  '首爾': {
    name: 'L7 弘大樂天飯店 (L7 Hongdae by LOTTE)',
    type: '潮流時尚精品飯店',
    rating: 4.7,
    price_level: '中價位（約 NT$ 3,600/晚）',
    address: '首爾特別市麻浦區楊花路141',
    reason: '位於弘大商圈核心，地鐵站步行 1 分鐘，機場快線直達，下樓即是美食與購物街。',
  },
  '曼谷': {
    name: '曼谷湄南河畔安納塔拉度假酒店 (Anantara Riverside)',
    type: '五星級奢華河畔度假村',
    rating: 4.8,
    price_level: '奢華度假（約 NT$ 4,800/晚）',
    address: '257/1-3 Charoennakorn Road, Bangkok',
    reason: '絕美湄南河景觀，提供免費接駁船往返 BTS 捷運站與 ICONSIAM 購物中心。',
  },
  '巴黎': {
    name: '巴黎歌劇院萬怡酒店 (Courtyard Paris)',
    type: '四星精品酒店',
    rating: 4.6,
    price_level: '高品質（約 NT$ 7,500/晚）',
    address: '209 Rue de Bercy, Paris',
    reason: '交通核心樞紐，步行即可至地鐵與里昂車站，前往羅浮宮、艾菲爾鐵塔便捷順暢。',
  },
  '倫敦': {
    name: '倫敦帕丁頓希爾頓飯店 (Hilton London Paddington)',
    type: '歷史經典星級飯店',
    rating: 4.5,
    price_level: '高品質（約 NT$ 7,800/晚）',
    address: '146 Praed St, London',
    reason: '希斯洛機場快線 15 分鐘直達帕丁頓車站，地鐵 4 條線匯流，四通八達。',
  },
  '冰島': {
    name: '雷克雅維克中心飯店 (Center Hotels Plaza)',
    type: '市中心極光觀景飯店',
    rating: 4.6,
    price_level: '極光探索型（約 NT$ 6,200/晚）',
    address: 'Aðalstræti 4, Reykjavik',
    reason: '位於雷克雅維克舊城中心，各類一日遊巴士停靠點在門口，生活採買極為方便。',
  },
};

const COUNTRY_ALIAS_MAP: Record<string, string[]> = {
  '日本': ['東京', '大阪', '京都', '沖繩', '福岡', '北海道', '名古屋', '日本', '京阪神'],
  '韓國': ['首爾', '釜山', '濟州', '大邱', '仁川', '韓國'],
  '泰國': ['曼谷', '清邁', '普吉', '芭達雅', '蘇美', '華欣', '泰國'],
  '歐洲': ['巴黎', '倫敦', '羅馬', '米蘭', '巴塞隆納', '馬德里', '阿姆斯特丹', '維也納', '柏林', '慕尼黑', '瑞士', '歐洲', '法國', '英國', '義大利'],
  '冰島': ['冰島', '雷克雅維克'],
};

function getPackingGroupForDestination(dest: string) {
  for (const [country, aliases] of Object.entries(COUNTRY_ALIAS_MAP)) {
    if (aliases.some((alias) => dest.includes(alias) || alias.includes(dest))) {
      return DESTINATION_PACKING_ITEMS[country];
    }
  }
  return null;
}
const DESTINATION_PACKING_ITEMS: Record<string, Record<string, Array<{ item_name: string; notes: string }>>> = {
  '日本': {
    essentials: [
      { item_name: 'Visit Japan Web (VJW) 入境 QR Code 截圖', notes: '出發前填寫完畢，入境審查與海關快速通關' },
      { item_name: 'Suica / ICOCA 交通西瓜卡（實體或 Apple Pay）', notes: '搭乘地鐵、公車、便利商店與投幣自動販賣機必備' },
      { item_name: '日幣現鈔與零錢包', notes: '部分拉麵食券機、神社御守與老店僅收現金' },
      { item_name: '護照正本（效期 6 個月以上）', notes: '隨身攜帶辦理免稅退稅' },
    ],
    clothing: [
      { item_name: '舒適耐走防滑健步鞋', notes: '日本自由行每日萬步必備，建議穿著已磨合的鞋款' },
      { item_name: '輕量折疊晴雨兩用傘', notes: '日本街頭隨身應對天氣變化' },
      { item_name: '折疊旅行擴充大提袋', notes: '藥妝戰利品與伴手禮爆箱時擴充' },
    ],
    electronics: [
      { item_name: '大容量行動電源 (需隨身登機)', notes: '拍照導航耗電極快，嚴禁放入托運行李' },
      { item_name: '日本專用雙平腳轉接插座 / 多孔快充組', notes: '日本為 100V 兩孔扁腳插座' },
      { item_name: '日本上網吃到飽 eSIM / SIM 卡', notes: '隨身查詢乘車轉乘與 Google Maps 導航' },
    ],
    toiletries: [
      { item_name: '休足時間 / 腿部舒緩貼布', notes: '連續多日長途行走後晚間放鬆舒緩' },
      { item_name: '個人常備藥（腸胃藥/止痛藥/綜合感冒藥）', notes: '隨身小包備用' },
      { item_name: '隨身保濕乳液與護唇膏', notes: '應對日本乾冷天氣' },
    ],
  },
  '韓國': {
    essentials: [
      { item_name: 'WOWPASS 換匯卡 / T-money 交通卡', notes: '地鐵、公車與超商無現金支付，機場即可開卡' },
      { item_name: 'Q-CODE 入境健康申報確認碼', notes: '出發前線上填妥以加速通關' },
      { item_name: '護照正本（效期 6 個月以上）', notes: '市區商圈購物即時退稅必備' },
    ],
    clothing: [
      { item_name: '好穿脫平底休閒鞋', notes: '參觀韓屋、特色茶屋或傳統餐廳席地而坐方便穿脫' },
      { item_name: '防風保暖外套與多層次穿搭', notes: '早晚溫差顯著' },
    ],
    electronics: [
      { item_name: '韓國專用 4.8mm 雙圓孔轉接頭 (Type C/F)', notes: '韓國插座孔徑較大，一般歐規 4.0mm 易接觸不良' },
      { item_name: 'Naver Map / Kakao T 叫車 App 預先安裝', notes: 'Google Maps 在韓國導航受限，當地專用地圖更準' },
      { item_name: '韓國上網 eSIM（含收發簡訊門號）', notes: '預約餐廳叫號與外送通知必備' },
    ],
    toiletries: [
      { item_name: '強效保濕精華液與潤唇膏', notes: '應對韓國極度乾燥氣候' },
      { item_name: '個人腸胃藥與解酒消化酵素', notes: '適應韓式辛辣美食與燒酒體驗' },
    ],
  },
  '泰國': {
    essentials: [
      { item_name: '泰國觀光免簽/護照與飯店機票確認單', notes: '入境備查與離線截圖' },
      { item_name: '海外高回饋信用卡與泰銖現鈔', notes: '夜市小吃、嘟嘟車與市集需現金' },
    ],
    clothing: [
      { item_name: '參觀大皇宮/寺廟專用透氣長褲與有袖上衣', notes: '泰國宗教景點嚴格規定不得露肩與露膝' },
      { item_name: '抗 UV 遮陽帽、太陽眼鏡與涼感防曬薄外套', notes: '熱帶豔陽戶外防護' },
      { item_name: '透氣快乾排汗短袖與涼鞋', notes: '應對熱帶炎熱氣候' },
    ],
    electronics: [
      { item_name: '水上市場/海灘專用手機防水袋', notes: '水上活動與搭船防止進水' },
      { item_name: 'Grab / Bolt 叫車 App 預先綁定信用卡', notes: '市區叫車免除語言不通與喊價困擾' },
      { item_name: '泰國上網高速吃到飽 SIM / eSIM', notes: '全天候穩定連線' },
    ],
    toiletries: [
      { item_name: '泰國草本強效防蚊噴霧與滾珠止癢膏', notes: '熱帶戶外防蚊防登革熱必備' },
      { item_name: 'SPF50+ 高係數防水防汗防曬乳', notes: '全天戶外強效防曬' },
      { item_name: '腸胃藥與電解質沖泡粉', notes: '品嚐道地街頭酸辣海鮮美食備用' },
    ],
  },
  '歐洲': {
    essentials: [
      { item_name: '貼身隱形防割防扒腰包', notes: '歐洲地鐵與熱門景點防扒手必備' },
      { item_name: '羅浮宮 / 凡爾賽宮 / 博物館預約時段門票憑證', notes: '熱門景點提前預約免排數小時長隊' },
      { item_name: '歐元 / 英鎊硬幣零錢', notes: '景點與火車站付費洗手間投幣使用' },
    ],
    clothing: [
      { item_name: '百搭防風風衣與洋蔥式保暖穿搭', notes: '應對歐洲多變陣雨與日夜溫差' },
      { item_name: '耐磨防滑好走平底包鞋', notes: '應對古老石板路路面長時間行走' },
    ],
    electronics: [
      { item_name: '歐規雙圓插頭 / 英規三腳方插專用轉接器', notes: '法德義為雙圓孔，英國為三腳方扁孔' },
      { item_name: '防盜鋼絲密碼行李鎖', notes: '火車行李架或飯店行李防盜' },
      { item_name: '歐洲跨國通用高速上網 eSIM', notes: '跨國無縫漫遊' },
    ],
    toiletries: [
      { item_name: '旅行分裝便攜盥洗組', notes: '歐洲許多環保飯店不提供牙刷牙膏拖鞋' },
      { item_name: '隨身消毒濕紙巾與便攜乾洗手', notes: '戶外隨時清潔防護' },
    ],
  },
  '冰島': {
    essentials: [
      { item_name: '信用卡預借現金 4 位數 PIN 碼', notes: '冰島全境無人自助加油站刷卡必備' },
      { item_name: '國際駕照正本與租車全險保單', notes: '冰島自駕與冰川探索必備' },
    ],
    clothing: [
      { item_name: 'GORE-TEX 等級防風防水防雨衝鋒衣褲', notes: '冰島瀑布水氣與極端暴風雨必備' },
      { item_name: '高筒抓地防滑防水登山健行鞋', notes: '冰川健行與火山岩步道行走安全' },
      { item_name: '藍湖 / 天空之泉溫泉專用泳衣與快乾毛巾', notes: '地熱溫泉泡湯必備' },
      { item_name: '保暖發熱內搭、羊毛厚襪、防風保暖毛帽與手套', notes: '戶外長時間追極光防寒' },
    ],
    electronics: [
      { item_name: '夜間極光攝影專用三腳架與防寒觸控手套', notes: '捕捉極光長曝光與夜景' },
      { item_name: '低溫防寒電池袋與大容量備用行動電源', notes: '極地低溫手機與相機耗電極快' },
    ],
    toiletries: [
      { item_name: '高保濕修護霜、護手霜與滋潤潤唇膏', notes: '強效抗寒風乾裂' },
      { item_name: '長效發熱暖暖包（貼式與手握式）', notes: '夜間戶外觀景保暖' },
    ],
  },
};

export function buildSystemPrompt(dest: string, days: number, startDate?: string, endDate?: string): string {
  const dateGuide = startDate && endDate
    ? `【出發與回程日期】指定出發日期為 ${startDate}，回程日期為 ${endDate}（共 ${days} 天）。每日 date_label 必須為真實日期格式（例如：${startDate} (Day 1) · 抵達與核心探索）。`
    : `【出發與回程日期】用戶選擇彈性時機，請由 AI 為 ${dest} 安排最合適出發季節與近期週六出發的完整 ${days} 天真實日期（例如：2026-10-17 (Day 1)）。`;

  return `你是 Atrip 頂級 AI 自由行旅遊管家。請根據目的地「${dest}」、出發日期與天數，產出包含【精選推薦飯店 (Basecamp)】、真實航班起降銜接與【深度針對 ${dest} 定制】的 4 大類完整行李打包清單。

${dateGuide}

【住宿與行程銜接規則】
1. recommendations.accommodations 必須推薦 1 間位於「${dest}」交通核心樞紐且評價極高的真實精選飯店作為固定 Basecamp 基地。
2. Day 1 第一天：第一個行程必須是「🏨 抵達與飯店 Check-in / 行李寄存」（category 設為 "accommodation_checkin"），標明前往該推薦飯店。
3. 每日行程最後一個景點的 transit_to_next 必須標註返回該推薦飯店（例如 route_name: "返回 飯店名稱", instructions: "結束本日行程，搭乘大眾運輸返回飯店休息"）。
4. Day ${days} 最後一天：最後一個行程必須保留提早 2.5~3 小時「前往機場辦理登機退稅與搭機返台」。

【行李打包清單 (packing_list) 深度客製化指令】
必須深入針對目的地「${dest}」的真實國情產出 4 大類別清單（每類別至少 2-3 項）：
- essentials（重要證件與金流）：請寫明「${dest}」當地的入境簽證要求（如電子簽證 e-Visa、免簽、落地簽等）、當地貨幣與支付習慣（如美金換匯、當地貨幣現鈔、刷卡注意事項）。
- clothing（季節衣物與配件）：請寫明配合「${dest}」在 ${startDate || '出遊季節'} 的真實氣候、日夜溫差、以及當地文化或宗教場所的著裝禮節（如寺廟/清真寺著裝要求：長褲、長袖或頭巾等）。
- electronics（3C 數位與通訊設備）：請寫明「${dest}」當地的插座規格（如歐規雙圓孔/英規三腳/美規等規格）、當地推薦之上網通訊工具（eSIM/當地 SIM 卡/必備導航與叫車 App）。
- toiletries（隨身常備藥與盥洗）：請寫明適應「${dest}」當地飲食與氣候環境的常備個人藥物（如腸胃藥、防蚊液、乾燥保濕等）。
⚠️ 嚴禁提供與「${dest}」無關的他國專屬名詞（例如前往非日本國家嚴禁出現 Suica、ICOCA 或 Visit Japan Web；前往非韓國國家嚴禁出現 WOWPASS 或 Q-CODE）！

【JSON 輸出格式】
{
  "meta": { "trip_title": "${dest} ${days} 天深度自由行", "destination": "${dest}", "total_days": ${days}, "start_date": "${startDate || '2026-10-17'}", "end_date": "${endDate || '2026-10-21'}", "currency": "TWD", "budget_level": "standard", "pace": "moderate" },
  "daily_itinerary": [
    {
      "day_number": 1,
      "date_label": "${startDate ? `${startDate} (Day 1) · 抵達與探索` : 'Day 1 · 抵達與探索'}",
      "summary": "搭乘航班抵達、飯店 Check-in 與周邊探索",
      "activities": [
        {
          "id": "act-d1-1",
          "time_slot": "13:30 - 15:00",
          "location_name": "飯店 Check-in 與行李寄存",
          "category": "accommodation_checkin",
          "duration_minutes": 90,
          "description": "前往推薦飯店辦理入住登記與行李放置，稍作休息後展開行程。",
          "coordinates": { "lat": 35.7147, "lng": 139.7967 },
          "cost_estimate": 0,
          "tips": "可先寄放行李於櫃檯，若房間已準備好可直接進房。",
          "transit_to_next": { "mode": "subway", "duration_minutes": 15, "route_name": "地鐵/巴士路線", "instructions": "從飯店出發前往下一個景點" }
        }
      ]
    }
  ],
  "transit_overview": { "primary_mode": "public_transit", "summary": "交通概況", "recommendations": ["推薦交通日票", "乘車秘訣"] },
  "recommendations": {
    "dining": ["必吃名店 1", "必吃名店 2"],
    "accommodations": [
      {
        "name": "真實推薦飯店全名",
        "type": "設計型景觀飯店 / 星級精品酒店",
        "rating": 4.6,
        "price_level": "標準舒適（約 NT$ 4,200/晚）",
        "address": "真實地址",
        "reason": "鄰近地鐵大站步行 2 分鐘，交通極為便利，適合作為固定 Basecamp 基地。",
        "google_map_query": "飯店名稱"
      }
    ],
    "notes": "注意事項"
  },
  "packing_list": [
    { "category": "essentials", "item_name": "針對${dest}的具體入境簽證/證件/換匯幣別全名", "is_checked": false, "notes": "針對${dest}的隨身攜帶與通關注意事項" },
    { "category": "clothing", "item_name": "針對${dest}氣候與宗教文化景點的特定著裝物品", "is_checked": false, "notes": "如清真寺長褲頭巾或極地防風防寒穿搭" },
    { "category": "electronics", "item_name": "針對${dest}當地的具體插座規格轉接頭與專用App", "is_checked": false, "notes": "如特定規格轉接頭或當地必備地圖叫車App" },
    { "category": "toiletries", "item_name": "針對${dest}飲食與氣候環境的個人防護常備品", "is_checked": false, "notes": "如特定防蚊、乾燥保濕或腸胃備用藥" }
  ]
}

【核心要求】
1. 純 JSON 輸出，不得包含 markdown。
2. 必須包含 recommendations.accommodations 推薦飯店。
3. packing_list 必須 100% 針對「${dest}」深度定制，包含全部 4 大類別。`;
}

export function normalizePayload(payload: any, startDate?: string, endDate?: string) {
  if (!payload.meta) payload.meta = {};
  if (startDate) payload.meta.start_date = startDate;
  if (endDate) payload.meta.end_date = endDate;

  const dest = String(payload.meta.destination || '東京');
  const matchedHotel = Object.entries(DESTINATION_HOTELS).find(([k]) => dest.includes(k))?.[1] || {
    name: `${dest} 精選星級酒店`,
    type: '市中心設計型景觀飯店',
    rating: 4.6,
    price_level: '舒適標準（約 NT$ 3,800/晚）',
    address: `${dest} 交通核心商圈`,
    reason: `鄰近主要地鐵與鐵道大站，生活機能與出遊極為便利，適合作為固定 Basecamp 基地。`,
  };

  // 確保 recommendations.accommodations 完整
  if (!payload.recommendations) payload.recommendations = {};
  if (!Array.isArray(payload.recommendations.accommodations) || payload.recommendations.accommodations.length === 0) {
    payload.recommendations.accommodations = [
      {
        name: matchedHotel.name,
        type: matchedHotel.type,
        rating: matchedHotel.rating,
        price_level: matchedHotel.price_level,
        address: matchedHotel.address,
        reason: matchedHotel.reason,
        google_map_query: matchedHotel.name,
      },
    ];
  }

  const primaryHotelName = payload.recommendations.accommodations[0]?.name || matchedHotel.name;

  if (!payload.meta.start_date) {
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
    payload.meta.start_date = defaultStart.toISOString().slice(0, 10);
  }

  const baseDate = new Date(payload.meta.start_date);

  if (Array.isArray(payload.daily_itinerary)) {
    payload.daily_itinerary.forEach((day: any, dIdx: number) => {
      const dNum = day.day_number || dIdx + 1;
      if (baseDate && !isNaN(baseDate.getTime())) {
        const thisDay = new Date(baseDate.getTime() + (dNum - 1) * 24 * 3600 * 1000);
        const yyyymmdd = thisDay.toISOString().slice(0, 10);
        const dayOfWeek = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][thisDay.getDay()];
        const cleanLabel = (day.date_label || '').replace(/^(第\s*\d+\s*天|\d{4}-\d{2}-\d{2}[^·]*)\s*·?\s*/, '');
        day.date_label = `${yyyymmdd} (${dayOfWeek}) · Day ${dNum} · ${cleanLabel || day.summary || '深度探索'}`;
      }

      if (Array.isArray(day.activities)) {
        day.activities.forEach((act: any, aIdx: number) => {
          if (!act.id) act.id = `act-d${dNum}-${aIdx + 1}-${randomUUID().slice(0, 6)}`;
          // 若為 Day 1 第一個 Check-in 行程
          if (dNum === 1 && aIdx === 0 && (!act.location_name || act.location_name.includes('飯店') || act.location_name.includes('Check-in'))) {
            act.category = 'accommodation_checkin';
            act.location_name = `飯店 Check-in：${primaryHotelName}`;
            act.description = `前往推薦住宿「${primaryHotelName}」辦理入住登記與行李寄存。`;
          }
        });

        // 每日最後一個行程的返程交通指明飯店全名
        const lastAct = day.activities[day.activities.length - 1];
        if (lastAct && lastAct.transit_to_next) {
          lastAct.transit_to_next.route_name = `返回 ${primaryHotelName}`;
          lastAct.transit_to_next.instructions = `結束本日行程，搭乘大眾運輸返回「${primaryHotelName}」休息放鬆`;
        }
      }
    });
  }

  const destPackingGroup = getPackingGroupForDestination(dest);

  const normalizedList: any[] = [];
  const allCategories = ['essentials', 'clothing', 'electronics', 'toiletries'];

  // 1. 如果有特定國家的專屬資料庫，先加入該國特定項目
  if (destPackingGroup) {
    allCategories.forEach((cat) => {
      const countryItems = destPackingGroup[cat] || [];
      countryItems.forEach((cItem, cIdx) => {
        normalizedList.push({
          id: `pack-${cat}-dst-${cIdx + 1}-${randomUUID().slice(0, 6)}`,
          category: cat,
          item_name: cItem.item_name,
          is_checked: false,
          notes: cItem.notes,
        });
      });
    });
  }

  // 2. 融合 LLM 針對該目的地（如烏茲別克、埃及、秘魯等任何全球國家）產生的專屬清單
  if (Array.isArray(payload.packing_list)) {
    payload.packing_list.forEach((item: any, idx: number) => {
      let cat = String(item.category || 'essentials').toLowerCase();
      if (cat === 'essential' || cat === 'document' || cat === 'documents') cat = 'essentials';
      if (cat === 'clothes') cat = 'clothing';
      if (cat === 'electronic' || cat === 'tech' || cat === 'digital') cat = 'electronics';
      if (cat === 'toiletry' || cat === 'medicine' || cat === 'medical') cat = 'toiletries';
      if (!allCategories.includes(cat)) cat = 'essentials';

      const itemName = String(item.item_name || item.item || item.name || '').trim();
      if (!itemName) return;

      // 如果目的地不是日本，嚴格過濾避免誤出日本專屬名詞
      const isJapanDest = ['東京', '大阪', '京都', '沖繩', '日本', '福岡', '北海道'].some((j) => dest.includes(j));
      if (!isJapanDest && (itemName.includes('Japan Web') || itemName.includes('VJW') || itemName.includes('Suica') || itemName.includes('西瓜卡') || itemName.includes('ICOCA'))) {
        return;
      }

      // 檢查是否重複
      const isDuplicate = normalizedList.some(
        (existing) =>
          existing.item_name.includes(itemName.slice(0, 4)) ||
          itemName.includes(existing.item_name.slice(0, 4))
      );

      if (!isDuplicate && normalizedList.filter((i) => i.category === cat).length < 6) {
        normalizedList.push({
          id: item.id || `pack-${cat}-ai-${idx + 1}-${randomUUID().slice(0, 6)}`,
          category: cat,
          item_name: itemName,
          is_checked: Boolean(item.is_checked || item.packed),
          notes: item.notes || item.tips || `${dest} 自由行專屬推薦`,
        });
      }
    });
  }

  // 3. 通用備援項目（僅在某類別數量不足 2 項且非特約國家時補充中性備品，絕不出現特定國家專屬品）
  const UNIVERSAL_TRAVEL_ITEMS: Record<string, Array<{ item_name: string; notes: string }>> = {
    essentials: [
      { item_name: `護照正本（效期 6 個月以上）與 ${dest} 簽證/入境申報單`, notes: '隨身攜帶並備份離線電子檔' },
      { item_name: '海外高回饋信用卡與當地貨幣現鈔/美金', notes: '備用金流與日常開支' },
    ],
    clothing: [
      { item_name: '舒適防滑健步鞋與透氣換洗衣物', notes: '每日自由行步程必備' },
      { item_name: '防風保暖外套或隨身輕量折疊晴雨傘', notes: '應對當地日夜溫差與多變天氣' },
    ],
    electronics: [
      { item_name: '大容量行動電源 (需隨身登機攜帶)', notes: '拍照與地圖導航必備，嚴禁放入托運行李' },
      { item_name: '萬國通用規格轉接插頭與多孔快充線組', notes: '適應各國不同插座孔徑' },
      { item_name: `當地高速上網 eSIM / 實體 SIM 卡`, notes: '出發前開通測試，隨時保持連線' },
    ],
    toiletries: [
      { item_name: '個人常備醫藥包（腸胃藥/止痛藥/感冒藥）', notes: '隨身攜帶以備不時之需' },
      { item_name: '旅行分裝便攜盥洗包與保濕乳液', notes: '隨身液體需小於 100ml' },
    ],
  };

  allCategories.forEach((cat) => {
    const countInCat = normalizedList.filter((i) => i.category === cat).length;
    if (countInCat < 2) {
      const neutrals = UNIVERSAL_TRAVEL_ITEMS[cat] || [];
      neutrals.forEach((neu, nIdx) => {
        const already = normalizedList.some((i) => i.item_name.includes(neu.item_name.slice(0, 4)));
        if (!already && normalizedList.filter((i) => i.category === cat).length < 4) {
          normalizedList.push({
            id: `pack-${cat}-uni-${nIdx + 1}-${randomUUID().slice(0, 6)}`,
            category: cat,
            item_name: neu.item_name,
            is_checked: false,
            notes: neu.notes,
          });
        }
      });
    }
  });

  // 4. 根據出發月份與季節天氣注入動態防護項目
  const month = baseDate.getMonth() + 1;
  if ([12, 1, 2].includes(month)) {
    if (!normalizedList.some((i) => i.item_name.includes('暖暖包'))) {
      normalizedList.push({
        id: `pack-toiletries-win-${randomUUID().slice(0, 6)}`,
        category: 'toiletries',
        item_name: '隨身發熱暖暖包（貼式與手握式）',
        is_checked: false,
        notes: `應對 ${dest} ${month} 月冬季低溫與戶外寒風`,
      });
    }
  } else if ([6, 7, 8].includes(month)) {
    if (!normalizedList.some((i) => i.item_name.includes('小風扇') || i.item_name.includes('涼感'))) {
      normalizedList.push({
        id: `pack-electronics-sum-${randomUUID().slice(0, 6)}`,
        category: 'electronics',
        item_name: '便攜式 USB 充電手持小風扇',
        is_checked: false,
        notes: `應對 ${dest} ${month} 月炎炎夏日戶外排隊散熱`,
      });
    }
  }

  payload.packing_list = normalizedList;
  return payload;
}



