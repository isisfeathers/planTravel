import { PackingItem } from '@/types/itinerary';

export interface DestinationProfile {
  country: string;
  currency: string;
  currencyTip: string;
  visaAndEntry: string;
  plugsAndVoltage: string;
  localNavAndApps: string;
  culturalDressTips?: string;
  customToiletries?: string;
  specialWarning?: string;
  isSouthernHemisphere?: boolean;
  isTropical?: boolean;
}

export const DESTINATION_PROFILES: Record<string, DestinationProfile> = {
  // 法國 / 巴黎
  '巴黎': {
    country: '法國',
    currency: '歐元 (EUR) 現鈔與免海外手續費信用卡',
    currencyTip: '歐洲刷卡普及，但建議準備少量 1~2 歐元硬幣用於付費公廁與小費',
    visaAndEntry: '護照正本（效期 6 個月以上）、申根免簽/ETIAS 許可確認',
    plugsAndVoltage: '歐規雙圓孔轉接頭 (Type C/E 220V/50Hz) 與多孔快充',
    localNavAndApps: '歐洲跨國通用高速 eSIM、Citymapper / RATP 巴黎地鐵 App',
    culturalDressTips: '歐洲古老石板路多，強烈建議穿著耐磨好走平底包鞋',
    customToiletries: '旅行分裝便攜盥洗組（法國多數環保飯店不主動提供牙刷牙膏與拖鞋）',
    specialWarning: '貼身隱形防扒腰包（羅浮宮、艾菲爾鐵塔與地鐵防扒手必備）',
  },
  '法國': {
    country: '法國',
    currency: '歐元 (EUR) 現鈔與海外回饋信用卡',
    currencyTip: '備妥小額歐元硬幣以備不時之需',
    visaAndEntry: '護照正本（效期 6 個月以上）、申根免簽/ETIAS 許可確認',
    plugsAndVoltage: '歐規雙圓孔轉接頭 (Type C/E 220V) 與快充頭',
    localNavAndApps: '歐洲跨國上網 eSIM、SNCF 法國國鐵 App',
    culturalDressTips: '耐走防滑好走平底包鞋與洋蔥式穿搭',
    customToiletries: '分裝洗沐組與個人常備藥（環保飯店不附一次性備品）',
    specialWarning: '防盜隱形腰包與防割後背包',
  },
  '英國': {
    country: '英國',
    currency: '英鎊 (GBP) 現鈔與感應式信用卡',
    currencyTip: '倫敦全面支援信用卡感應搭乘地鐵公車，現金需求極低',
    visaAndEntry: '護照正本（效期 6 個月以上）、英國 ETA / 免簽入境憑證',
    plugsAndVoltage: '英規三腳大方扁插 (Type G 230V) 與多孔充電器',
    localNavAndApps: '英國高速 eSIM、Citymapper 倫敦交通導航 App',
    culturalDressTips: '抗風輕量摺疊傘與防風防潑水風衣（英國多短暫陣雨）',
    customToiletries: '保濕潤膚乳液與護唇膏、個人常備感冒腸胃藥',
  },
  '倫敦': {
    country: '英國',
    currency: '英鎊 (GBP) 現鈔與感應式信用卡 (Contactless)',
    currencyTip: '倫敦全面支援信用卡感應搭乘地鐵公車，現金需求極低',
    visaAndEntry: '護照正本（效期 6 個月以上）、英國 ETA / 免簽入境憑證',
    plugsAndVoltage: '英規三腳大方扁插 (Type G 230V) 與多孔充電器',
    localNavAndApps: '英國高速 eSIM、Citymapper 倫敦交通導航 App',
    culturalDressTips: '抗風輕量摺疊傘與防風防潑水風衣（倫敦多短暫陣雨）',
    customToiletries: '保濕潤膚乳液與護唇膏、個人常備感冒腸胃藥',
    specialWarning: '隨身防盜隨手提袋',
  },
  '義大利': {
    country: '義大利',
    currency: '歐元 (EUR) 現鈔與信用卡',
    currencyTip: '小額歐元硬幣投幣洗手間與小吃冰淇淋店',
    visaAndEntry: '護照正本（效期 6 個月以上）、熱門景點預約門票',
    plugsAndVoltage: '歐規雙圓孔 (Type C/L 230V)',
    localNavAndApps: '歐洲多國 eSIM、Trenitalia 義大利國鐵 App',
    culturalDressTips: '參觀教堂需著過膝長褲/長裙與有袖上衣（嚴禁露肩露膝）',
    customToiletries: '耐磨防滑平底鞋（應對古道石板路）與保濕防曬',
    specialWarning: '防扒防割貼身包（觀光景點防扒）',
  },
  '羅馬': {
    country: '義大利',
    currency: '歐元 (EUR) 現鈔與信用卡',
    currencyTip: '小額歐元硬幣投幣洗手間與小吃冰淇淋店',
    visaAndEntry: '護照正本（效期 6 個月以上）、梵蒂岡/羅馬競技場預約門票',
    plugsAndVoltage: '歐規雙圓孔 (Type C/L 230V)',
    localNavAndApps: '歐洲多國 eSIM、Trenitalia 義大利國鐵 App',
    culturalDressTips: '參觀聖彼得大教堂/梵蒂岡需著過膝長褲與有袖上衣（禁露肩露膝）',
    customToiletries: '耐磨防滑平底鞋（應對羅馬古道石板路）與保濕防曬',
    specialWarning: '防扒防割貼身包（特雷維噴泉與競技場周邊注意防扒）',
  },

  // 日本
  '日本': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與零錢包',
    currencyTip: '部分拉麵食券機、神社御守與老店僅收現金',
    visaAndEntry: 'Visit Japan Web (VJW) 入境 QR Code 截圖、護照正本（免稅退稅備用）',
    plugsAndVoltage: '日本 100V 雙扁腳插頭（與台灣相同規格）與多孔快充',
    localNavAndApps: 'Suica / ICOCA 交通西瓜卡、日本高速上網 eSIM / SIM 卡',
    culturalDressTips: '舒適耐走防滑健步鞋（每日萬步自由行必備）、輕量折疊晴雨傘',
    customToiletries: '休足時間腿部放鬆貼布、個人常備胃腸藥/止痛藥/感冒藥',
  },
  '東京': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與零錢包',
    currencyTip: '部分拉麵食券機、神社御守與老店僅收現金',
    visaAndEntry: 'Visit Japan Web (VJW) 入境 QR Code 截圖、護照正本（免稅退稅備用）',
    plugsAndVoltage: '日本 100V 雙扁腳插頭（與台灣相同規格）與多孔快充',
    localNavAndApps: 'Suica / PASMO 交通西瓜卡、日本高速上網 eSIM / SIM 卡',
    culturalDressTips: '舒適耐走防滑健步鞋（每日萬步必備）、輕量折疊晴雨傘',
    customToiletries: '休足時間舒緩貼布、個人常備胃腸藥/EVE止痛藥',
  },
  '大阪': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與零錢包',
    currencyTip: '黑門市場小吃與道頓堀部分攤位需現金',
    visaAndEntry: 'Visit Japan Web (VJW) 入境 QR Code 截圖、護照正本',
    plugsAndVoltage: '日本 100V 雙扁插頭與大容量行動電源',
    localNavAndApps: 'ICOCA / Suica 交通卡、環球影城 USJ 官方 App',
    culturalDressTips: '舒適耐走好穿健步鞋、購物折疊大提袋',
    customToiletries: '休足時間貼布、常備胃腸藥（美食巡禮必備）',
  },
  '京都': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與零錢包',
    currencyTip: '寺廟參拜御朱印與投幣巴士多收現金',
    visaAndEntry: 'Visit Japan Web 入境 QR Code、護照正本',
    plugsAndVoltage: '日本 100V 雙扁插座與快充頭',
    localNavAndApps: 'ICOCA 交通卡、Google Maps 巴士路線導航',
    culturalDressTips: '參拜寺廟好穿脫好走包鞋、日夜溫差防風外套',
    customToiletries: '腿部放鬆貼布、個人常備藥物',
  },
  '沖繩': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與信用卡',
    currencyTip: '自駕高速公路收費站與海灘小店需現金',
    visaAndEntry: '護照正本、台灣駕照正本與日文譯本（沖繩租車自駕必備）',
    plugsAndVoltage: '日本 100V 雙扁插頭、車用手機支架與車充',
    localNavAndApps: '沖繩上網 eSIM、沖繩自駕 Google Maps / MapCode',
    culturalDressTips: '海灘防曬水母衣、太陽眼鏡、遮陽帽與海灘拖鞋',
    customToiletries: '海洋友善高係數防曬乳、蘆薈曬後舒緩凝膠',
  },
  '福岡': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與零錢包',
    currencyTip: '博多中洲屋台夜市小吃多僅收現金',
    visaAndEntry: 'Visit Japan Web 入境 QR Code、護照正本',
    plugsAndVoltage: '日本 100V 雙扁插座與行動電源',
    localNavAndApps: 'SUGOCA / Suica 交通卡、JR 九州鐵路 App',
    culturalDressTips: '好走健步鞋、早晚防風外套',
    customToiletries: '腸胃藥（品嚐博多拉麵牛腸鍋必備）、休足時間',
  },
  '札幌': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與信用卡',
    currencyTip: '二條市場海鮮與路邊攤販備妥現金',
    visaAndEntry: 'Visit Japan Web 入境 QR Code、護照正本',
    plugsAndVoltage: '日本 100V 雙扁插頭、防寒行動電源',
    localNavAndApps: 'Kitaca / Suica 交通卡、北海道上網 eSIM',
    culturalDressTips: '防滑防水雪靴/健步鞋、防風保暖多層次衣物',
    customToiletries: '超滋潤保濕霜、護唇膏、發熱暖暖包',
  },
  '北海道': {
    country: '日本',
    currency: '日幣現鈔 (JPY) 與信用卡',
    currencyTip: '道東或鄉間景點備妥部分現金',
    visaAndEntry: 'Visit Japan Web 入境 QR Code、駕照日文譯本（若自駕）',
    plugsAndVoltage: '日本 100V 雙扁插頭與行動電源',
    localNavAndApps: '北海道上網 eSIM、JR Hokkaido 鐵路 App',
    culturalDressTips: '防風保暖羽絨衣、保暖發熱衣、抓地防滑鞋',
    customToiletries: '保濕修護面霜、護手霜、個人常備藥',
  },
  // 韓國
  '首爾': {
    country: '韓國',
    currency: '韓元現鈔 (KRW) 與海外信用卡',
    currencyTip: 'WOWPASS 換匯儲值卡或 T-money 交通卡地鐵超商無現金支付',
    visaAndEntry: '護照正本（效期 6 個月以上）、Q-CODE 入境健康申報確認碼',
    plugsAndVoltage: '韓國專用 4.8mm 雙大圓孔轉接頭 (Type C/F 220V/60Hz)',
    localNavAndApps: 'Naver Map / Kakao T 叫車 App（Google Maps 在韓國導航受限）',
    culturalDressTips: '好穿脫休閒平底鞋（韓屋與傳統餐廳席地而坐方便穿脫）',
    customToiletries: '強效保濕精華與潤唇膏（應對乾冷氣候）、解酒消化酵素與腸胃藥',
  },
  '韓國': {
    country: '韓國',
    currency: '韓元現鈔 (KRW) 與 WOWPASS 卡',
    currencyTip: '韓國全面無現金化，刷卡與 WOWPASS 極方便',
    visaAndEntry: '護照正本（效期 6 個月以上）、Q-CODE 申報碼',
    plugsAndVoltage: '韓國 4.8mm 雙大圓插頭 (Type C/F 220V)',
    localNavAndApps: 'Naver Map 地圖 App、韓國上網 eSIM（含收發簡訊功能）',
    culturalDressTips: '好穿脫平底鞋、多層次防風保暖穿搭',
    customToiletries: '極致保濕保養品、護唇膏、個人常備藥物',
  },
  '曼谷': {
    country: '泰國',
    currency: '泰銖現鈔 (THB) 與海外回饋信用卡',
    currencyTip: '夜市小吃、路邊攤、嘟嘟車與市集主要收現金，建議備足泰銖',
    visaAndEntry: '護照正本（效期 6 個月以上）、免簽/簽證確認文件、機票與飯店憑證',
    plugsAndVoltage: '美規雙扁/歐規雙圓通用插座 (220V/50Hz) 與大容量行動電源',
    localNavAndApps: 'Grab / Bolt 叫車 App（預先綁定信用卡，避免語言與喊價困擾）',
    culturalDressTips: '參觀大皇宮/寺廟專用透氣長褲與有袖上衣（嚴格禁止露肩露膝）、抗 UV 遮陽帽',
    customToiletries: '泰國草本防蚊噴霧與止癢膏（防登革熱必備）、SPF50+ 防水防曬乳、腸胃止瀉藥',
    isTropical: true,
  },
  '泰國': {
    country: '泰國',
    currency: '泰銖現鈔 (THB) 與信用卡',
    currencyTip: '夜市市集與小吃需備足現金',
    visaAndEntry: '護照正本（效期 6 個月以上）、免簽/簽證確認件',
    plugsAndVoltage: '通用 220V 插座、手機防水袋',
    localNavAndApps: 'Grab 叫車 App、泰國高速吃到飽上網 eSIM',
    culturalDressTips: '參觀寺廟透氣過膝長褲長裙、涼感防曬薄外套',
    customToiletries: '強效防蚊液、高係數防曬乳、個人常備腸胃藥物',
    isTropical: true,
  },
  '新加坡': {
    country: '新加坡',
    currency: '新加坡幣 (SGD) 與感應信用卡',
    currencyTip: '熟食中心部分攤位收現金或 PayNow，地鐵可直接感應信用卡',
    visaAndEntry: '新加坡電子入境卡 (SG Arrival Card) 抵達前 3 天線上填妥、護照正本',
    plugsAndVoltage: '英規三腳方插 (Type G 230V/50Hz)',
    localNavAndApps: 'Grab 叫車 App、新加坡高速上網 eSIM',
    culturalDressTips: '透氣快乾短袖、抗 UV 遮陽傘、室內冷氣房薄外套',
    customToiletries: '隨身面紙、個人常備藥、高防曬乳',
    isTropical: true,
  },
  '紐約': {
    country: '美國',
    currency: '美金現鈔 (USD) 與海外高回饋晶片信用卡',
    currencyTip: '美國全面普及 Apple Pay / 信用卡刷卡，注意餐廳小費文化',
    visaAndEntry: '美國 ESTA 電子旅行授權許可截圖、護照正本（效期 6 個月以上）',
    plugsAndVoltage: '美規雙扁插頭（120V 與台灣相同）與多孔快充',
    localNavAndApps: '北美高速上網吃到飽 eSIM、OMNY 感應搭乘地鐵',
    culturalDressTips: '每日暴走萬步舒適氣墊健步鞋、百老匯觀劇微正式服裝',
    customToiletries: '強效保濕乳霜與護唇膏、個人常備藥（止痛/感冒/胃腸藥）',
  },
  '雪梨': {
    country: '澳洲',
    currency: '澳幣現鈔 (AUD) 與海外回饋信用卡',
    currencyTip: '澳洲幾乎全面無現金，直接刷信用卡感應搭乘火車渡輪',
    visaAndEntry: '澳洲 ETA (Subclass 601) 電子簽證核准憑證、入境旅客卡',
    plugsAndVoltage: '澳規八字形三扁腳轉接頭 (Type I 230V/50Hz)',
    localNavAndApps: '澳洲高速上網 eSIM、Opal Travel 交通 App',
    culturalDressTips: '抗強烈紫外線太陽眼鏡、寬簷遮陽帽、好走健步鞋',
    customToiletries: '澳洲認證 SPF50+ 強效防曬乳、保濕修護面霜',
    isSouthernHemisphere: true,
  },
  '冰島': {
    country: '冰島',
    currency: '冰島克朗 (ISK) 與具備 4 位數 PIN 碼之信用卡',
    currencyTip: '冰島全境刷卡，無人加油站必須輸入信用卡預借現金 PIN 碼',
    visaAndEntry: '護照正本、國際駕照正本與租車保單確認件',
    plugsAndVoltage: '歐規雙圓孔 (Type C/F 230V) 與大容量防寒行動電源',
    localNavAndApps: '冰島上網 eSIM、Vedur 氣象 App 與 SafeTravel 路況 App',
    culturalDressTips: 'GORE-TEX 等級防風防水防雨衝鋒衣褲、高筒抓地防滑登山鞋、藍湖溫泉泳裝',
    customToiletries: '極地夜間追極光防寒毛帽手套、暖暖包、超滋潤修護霜與護唇膏',
  },
};

export function getDestinationProfile(destination: string): DestinationProfile {
  const clean = (destination || '').trim();
  for (const [key, profile] of Object.entries(DESTINATION_PROFILES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return profile;
    }
  }

  // 預設通用國際出國配置
  return {
    country: clean || '海外目的地',
    currency: `${clean || '當地'}貨幣現鈔與海外高回饋信用卡`,
    currencyTip: '建議出發前於國內銀行或機場兌換適量當地現鈔應急，搭配免海外手續費信用卡',
    visaAndEntry: '護照正本（效期 6 個月以上）、目的地入境簽證/申報卡確認單',
    plugsAndVoltage: '萬國通用多孔轉接插頭組與多孔快充線',
    localNavAndApps: '目的地高速漫遊上網 eSIM / SIM 卡、Google Maps 離線地圖',
    culturalDressTips: '舒適好走防滑健步鞋、多層次洋蔥式防風穿搭',
    customToiletries: '個人常備藥（腸胃藥/止痛退燒藥/綜合感冒藥/暈車藥）、分裝盥洗用品包',
  };
}

export function generateDynamicPackingList(
  destination: string,
  totalDays: number = 3,
  startDate?: string,
  specialNeeds?: string
): PackingItem[] {
  const profile = getDestinationProfile(destination);
  const cleanDest = destination
    .replace(/[0-9]+\s*天.*$/, '')
    .replace(/自由行.*$/, '')
    .trim() || '目的地';

  const days = Math.max(1, Number(totalDays) || 3);
  const nights = Math.max(1, days - 1);
  const tripLengthText = `${days} 天 ${nights} 夜`;

  // 計算出發月份與季節
  let month = 10; // 預設秋季
  if (startDate) {
    const d = new Date(startDate);
    if (!isNaN(d.getTime())) {
      month = d.getMonth() + 1;
    }
  }

  // 判定季節
  let isWinter = [12, 1, 2].includes(month);
  let isSummer = [6, 7, 8].includes(month);
  let isSpringAutumn = [3, 4, 5, 9, 10, 11].includes(month);

  // 南半球季節反轉
  if (profile.isSouthernHemisphere) {
    isWinter = [6, 7, 8].includes(month);
    isSummer = [12, 1, 2].includes(month);
    isSpringAutumn = [3, 4, 5, 9, 10, 11].includes(month);
  }

  const seasonText = profile.isTropical
    ? '熱帶氣候（全年高溫多雨）'
    : isWinter
    ? `${month} 月冬季寒冷氣候`
    : isSummer
    ? `${month} 月夏季高溫氣候`
    : `${month} 月春秋宜人微涼氣候`;

  // 1. 重要證件與金流 (essentials)
  const essentials: Array<{ item_name: string; notes: string }> = [
    {
      item_name: '護照正本（效期 6 個月以上）與電子備份',
      notes: '隨身登機包攜帶，請勿放入托運行李；手機存護照影本與證件照備份',
    },
    {
      item_name: profile.visaAndEntry,
      notes: '入境審查必備，建議截圖或列印紙本備查',
    },
    {
      item_name: profile.currency,
      notes: profile.currencyTip,
    },
    {
      item_name: '機票電子行程單、飯店預訂確認函與旅行平安險保單',
      notes: '海關抽查與突發就醫保障必備',
    },
  ];

  if (profile.specialWarning) {
    essentials.push({
      item_name: profile.specialWarning,
      notes: `前往${cleanDest}熱門觀光景點防扒手防遺失保護財物`,
    });
  }

  // 2. 季節衣物與配件 (clothing)
  const clothingCount = days;
  const clothing: Array<{ item_name: string; notes: string }> = [
    {
      item_name: `舒適透氣換洗衣物與內著 ${clothingCount} 套`,
      notes: `專為 ${tripLengthText} 自由行規劃（每日 1 套換洗，建議以輕量好穿搭為主）`,
    },
    {
      item_name: isWinter
        ? '防風保暖羽絨厚外套、發熱保暖內搭衣褲與毛帽手套'
        : isSummer || profile.isTropical
        ? '抗 UV 涼感防曬薄外套、遮陽帽與太陽眼鏡'
        : '百搭防風風衣外套與多層次洋蔥式保暖穿搭',
      notes: `配合 ${cleanDest} ${seasonText} 與日夜溫差保護`,
    },
    {
      item_name: '耐磨好走防滑健步包鞋（建議穿著已磨合鞋款）',
      notes: `應對 ${cleanDest} 每日萬步自由行、景點階梯與古蹟石板路面`,
    },
    {
      item_name: '輕量便攜折疊晴雨兩用傘與收納袋',
      notes: '隨身包隨時應對突發陣雨與豔陽防曬',
    },
  ];

  if (profile.culturalDressTips) {
    clothing.push({
      item_name: '當地文化/宗教景點專用著裝規範服飾',
      notes: profile.culturalDressTips,
    });
  }

  if (days >= 5) {
    clothing.push({
      item_name: '旅行折疊行李擴充大提袋 / 壓縮收納袋',
      notes: '返程伴手禮與戰利品爆箱時擴充容量',
    });
  }

  // 3. 3C 數位與充電設備 (electronics)
  const electronics: Array<{ item_name: string; notes: string }> = [
    {
      item_name: '大容量行動電源 (10000~20000mAh，需隨身登機)',
      notes: '拍照錄影與全天地圖導航耗電極快，嚴禁放入托運行李',
    },
    {
      item_name: profile.plugsAndVoltage,
      notes: `符合 ${cleanDest} 當地電壓與插座標準`,
    },
    {
      item_name: profile.localNavAndApps,
      notes: `全天候穩定連線導航與查乘車路線`,
    },
    {
      item_name: '多孔快充充電頭與各設備專用充電線組',
      notes: '夜間飯店同時充手機、相機、手錶與行動電源',
    },
  ];

  // 4. 隨身常備藥與盥洗 (toiletries)
  const toiletries: Array<{ item_name: string; notes: string }> = [
    {
      item_name: '個人常備藥品包（必帶：腸胃藥/止痛退燒/綜合感冒藥/暈車藥）',
      notes: `應對 ${cleanDest} 異國飲食水土與長途交通飛行`,
    },
    {
      item_name: profile.customToiletries || '旅行分裝便攜盥洗用品組（洗面乳/洗沐分裝瓶）',
      notes: `符合航空公司單瓶 100ml 隨身液體限制，避免當地環保飯店無備品`,
    },
    {
      item_name: isWinter
        ? '高保濕滋潤乳霜、護手霜與潤唇膏'
        : isSummer || profile.isTropical
        ? 'SPF50+ 高係數防水防汗防曬乳與防蚊噴霧'
        : '隨身保濕乳液、護唇膏與便攜乾洗手',
      notes: `針對 ${cleanDest} ${seasonText} 之皮膚防護`,
    },
    {
      item_name: '隨身消毒濕紙巾、面紙與免洗護理小包',
      notes: '戶外用餐前清潔與公共洗手間應急備用',
    },
  ];

  // 組合標準 PackingItem 清單
  const allGenerated: PackingItem[] = [];
  let itemCounter = 1;

  const pushCategoryItems = (cat: PackingItem['category'], list: Array<{ item_name: string; notes: string }>) => {
    list.forEach((item) => {
      allGenerated.push({
        id: `pack-${cat}-${itemCounter++}`,
        category: cat,
        item_name: item.item_name,
        is_checked: false,
        notes: item.notes,
      });
    });
  };

  pushCategoryItems('essentials', essentials);
  pushCategoryItems('clothing', clothing);
  pushCategoryItems('electronics', electronics);
  pushCategoryItems('toiletries', toiletries);

  return allGenerated;
}