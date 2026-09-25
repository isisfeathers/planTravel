export interface GatewayTransitInfo {
  gateway_city: string;
  gateway_airport_code: string;
  gateway_airport_name: string;
  transit_instruction: string;
  transit_estimated_time: string;
}

export interface GatewayMapping {
  keywords: string[];
  gatewayCity: string;
  airportCode: string;
  airportName: string;
  instruction: string;
  estimatedTime: string;
  airlineName?: string;
  airlineCode2?: string;
  price?: number;
  hours?: number;
}

export const GATEWAY_DATABASE: GatewayMapping[] = [
  // 法國南部 / 普羅旺斯 / 蔚藍海岸
  {
    keywords: ['普羅旺斯', '南法', '亞維農', '艾克斯', '尼斯', '坎城', '蔚藍海岸', '馬賽'],
    gatewayCity: '尼斯 / 巴黎',
    airportCode: 'NCE',
    airportName: '尼斯蔚藍海岸 (NCE) / 巴黎戴高樂 (CDG)',
    instruction: '抵達巴黎或尼斯機場後，建議租車自駕，或於航廈搭乘 TGV 法國高速鐵路直達普羅旺斯',
    estimatedTime: 'TGV 約 2.5 ~ 3 小時 / 自駕約 2 小時',
    airlineName: '長榮航空 EVA Air (巴黎轉高鐵/法航)',
    airlineCode2: 'BR087',
    price: 33500,
    hours: 15.5,
  },
  // 日本北陸 / 白川鄉合掌村 / 高山
  {
    keywords: ['合掌村', '白川鄉', '高山', '金澤', '飛驒', '富山', '立山黑部'],
    gatewayCity: '名古屋 / 小松',
    airportCode: 'NGO',
    airportName: '名古屋中部國際 (NGO)',
    instruction: '抵達名古屋後，可於名鐵巴士中心搭乘「岐阜巴士合掌村專車」或轉乘 JR 飛驒特急前往',
    estimatedTime: '高速巴士約 2 小時 40 分',
    airlineName: '星宇航空 STARLUX 直飛',
    airlineCode2: 'JX838',
    price: 12800,
    hours: 2.8,
  },
  // 日本關東近郊 / 富士山 / 河口湖 / 箱根 / 輕井澤 / 日光
  {
    keywords: ['富士山', '河口湖', '箱根', '輕井澤', '日光', '鎌倉', '橫濱', '伊豆'],
    gatewayCity: '東京',
    airportCode: 'HND',
    airportName: '東京羽田 (HND) / 成田 (NRT)',
    instruction: '抵達東京後，可於新宿搭乘「富士回遊特急電車」或高速巴士直達河口湖/箱根',
    estimatedTime: '特急電車約 1 小時 50 分',
    airlineName: '星宇航空 STARLUX 直飛',
    airlineCode2: 'JX800',
    price: 13500,
    hours: 3.5,
  },
  // 希臘海島 / 聖托里尼 / 米克諾斯
  {
    keywords: ['聖托里尼', '米克諾斯', '扎金索斯', '沉船灣', '希臘海島', '伊亞', '費拉'],
    gatewayCity: '雅典',
    airportCode: 'ATH',
    airportName: '雅典國際機場 (ATH)',
    instruction: '抵達雅典後，可於比雷埃夫斯港轉乘快艇渡輪，或轉搭愛琴海航空國內線直達海島',
    estimatedTime: '渡輪約 4.5 小時 / 國內線飛機 45 分鐘',
    airlineName: '新加坡航空 Singapore Airlines (轉機)',
    airlineCode2: 'SQ877',
    price: 32500,
    hours: 16.0,
  },
  // 瑞士阿爾卑斯山區 / 策馬特 / 少女峰 / 格林德瓦 / 因特拉肯
  {
    keywords: ['策馬特', '馬特洪峰', '少女峰', '格林德瓦', '因特拉肯', '琉森', '鐵力士山'],
    gatewayCity: '蘇黎世 / 日內瓦',
    airportCode: 'ZRH',
    airportName: '蘇黎世國際 (ZRH)',
    instruction: '抵達蘇黎世機場後，可直接於機場地下火車站搭乘瑞士國鐵 SBB 景觀列車直達山區',
    estimatedTime: 'SBB 國鐵約 2 ~ 3 小時',
    airlineName: '瑞士國際航空 SWISS / 長榮航空',
    airlineCode2: 'LX139',
    price: 36800,
    hours: 14.5,
  },
  // 奧地利湖區 / 哈修塔特 / 薩爾斯堡
  {
    keywords: ['哈修塔特', '薩爾斯堡', '湖區', '國王湖'],
    gatewayCity: '維也納 / 慕尼黑',
    airportCode: 'VIE',
    airportName: '維也納國際 (VIE) / 慕尼黑 (MUC)',
    instruction: '抵達維也納或慕尼黑後，搭乘奧地利國鐵 ÖBB 列車轉乘接駁渡輪抵達哈修塔特',
    estimatedTime: 'ÖBB 列車約 3 小時',
    airlineName: '長榮航空 EVA Air 直飛',
    airlineCode2: 'BR061',
    price: 31500,
    hours: 13.8,
  },
  // 義大利托斯卡尼 / 佛羅倫斯 / 五漁村
  {
    keywords: ['托斯卡尼', '佛羅倫斯', '五漁村', '比薩', '西恩納'],
    gatewayCity: '羅馬 / 米蘭',
    airportCode: 'FCO',
    airportName: '羅馬菲烏米奇諾 (FCO) / 米蘭 (MXP)',
    instruction: '抵達羅馬或米蘭後，搭乘義大利高鐵 Frecciarossa / Italo 直達佛羅倫斯與托斯卡尼酒莊區',
    estimatedTime: '高鐵約 1 小時 30 分',
    airlineName: '中華航空 China Airlines 直飛',
    airlineCode2: 'CI075',
    price: 33500,
    hours: 14.8,
  },
  // 芬蘭拉普蘭 / 羅瓦涅米 / 聖誕老人村 / 極光
  {
    keywords: ['羅瓦涅米', '聖誕老人村', '拉普蘭', '北極圈', '極光', '伊納里'],
    gatewayCity: '赫爾辛基',
    airportCode: 'HEL',
    airportName: '赫爾辛基萬塔 (HEL)',
    instruction: '抵達赫爾辛基後，可轉乘芬蘭國鐵 VR 北極特快臥鋪夜車，或轉乘芬航國內線直達羅瓦涅米',
    estimatedTime: 'VR 臥鋪火車一晚 / 國內線 1 小時 15 分',
    airlineName: '芬蘭航空 Finnair / 土耳其航空',
    airlineCode2: 'AY100',
    price: 34500,
    hours: 16.5,
  },
  // 加拿大洛磯山脈 / 班夫國家公園 / 露易絲湖
  {
    keywords: ['班夫', '露易絲湖', '洛磯山', '傑斯伯', '卡加利'],
    gatewayCity: '卡加利 / 溫哥華',
    airportCode: 'YYC',
    airportName: '卡加利國際 (YYC) / 溫哥華 (YVR)',
    instruction: '抵達卡加利或溫哥華後，建議於機場租車自駕，沿弓谷景觀公路開往班夫國家公園',
    estimatedTime: '卡加利自駕約 1 小時 30 分',
    airlineName: '長榮航空 EVA Air (溫哥華轉機)',
    airlineCode2: 'BR010',
    price: 33500,
    hours: 13.5,
  },
  // 美國大峽谷 / 羚羊峽谷 / 佩吉
  {
    keywords: ['大峽谷', '羚羊峽谷', '馬蹄灣', '錫安國家公園', '佩吉'],
    gatewayCity: '拉斯維加斯 / 鳳凰城',
    airportCode: 'LAS',
    airportName: '拉斯維加斯哈里瑞德 (LAS)',
    instruction: '抵達拉斯維加斯後，建議租車自駕公路旅行或參加大峽谷國家公園一日觀光巴士團',
    estimatedTime: '自駕約 4 小時',
    airlineName: '星宇航空 STARLUX (洛杉磯轉機)',
    airlineCode2: 'JX002',
    price: 32500,
    hours: 14.0,
  },
  // 紐西蘭南島湖區 / 皇后鎮 / 米佛峽灣 / 庫克山
  {
    keywords: ['皇后鎮', '米佛峽灣', '庫克山', '瓦納卡', '蒂卡波'],
    gatewayCity: '皇后鎮 / 基督城',
    airportCode: 'ZQN',
    airportName: '皇后鎮國際 (ZQN) / 基督城 (CHC)',
    instruction: '抵達奧克蘭後轉機直達皇后鎮，或於基督城租露營車自駕環南島湖區',
    estimatedTime: '奧克蘭轉機 1 小時 50 分',
    airlineName: '紐西蘭航空 Air New Zealand 直飛/轉機',
    airlineCode2: 'NZ078',
    price: 31800,
    hours: 13.0,
  },
  // 泰國度假海島 / 普吉島 / 蘇美島 / 芭達雅 / 華欣
  {
    keywords: ['普吉島', '蘇美島', '芭達雅', '華欣', '沙美島', '喀比'],
    gatewayCity: '曼谷 / 普吉',
    airportCode: 'BKK',
    airportName: '曼谷素萬那普 (BKK) / 普吉 (HKT)',
    instruction: '抵達曼谷後，可搭乘包車接駁直達芭達雅/華欣，或轉搭曼谷航空國內線飛往蘇美島',
    estimatedTime: '曼谷包車約 2 小時 / 國內線 1 小時',
    airlineName: '長榮航空 EVA Air / 星宇航空',
    airlineCode2: 'BR211',
    price: 11800,
    hours: 3.8,
  },
];

/**
 * 景點與大區至門戶機場解析器
 */
export function resolveGateway(destination?: string): GatewayMapping | null {
  if (!destination) return null;
  const clean = destination
    .replace(/[0-9]+\s*天.*$/, '')
    .replace(/自由行.*$/, '')
    .replace(/深度遊.*$/, '')
    .replace(/之旅.*$/, '')
    .replace(/度假.*$/, '')
    .trim();

  return (
    GATEWAY_DATABASE.find((item) =>
      item.keywords.some((kw) => clean.includes(kw) || kw.includes(clean))
    ) || null
  );
}
