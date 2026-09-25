/**
 * 景點行程圖片對照庫
 * 支援預設熱門城市圖片對照與未匹配城市的預設三圖隨機分配
 */

const DESTINATION_IMAGE_MAP: Record<string, string[]> = {
  // 巴黎 / 法國 / 普羅旺斯
  '巴黎': ['巴黎-01.jpg', '巴黎-02.jpg'],
  '法國': ['巴黎-01.jpg', '巴黎-02.jpg'],
  '普羅旺斯': ['巴黎-01.jpg', '巴黎-02.jpg'],
  '南法': ['巴黎-01.jpg', '巴黎-02.jpg'],
  '羅馬': ['巴黎-01.jpg', '巴黎-02.jpg'],
  '義大利': ['巴黎-01.jpg', '巴黎-02.jpg'],

  // 冰島
  '冰島': ['冰島-01.jpg', '冰島-02.jpg'],
  '雷克雅維克': ['冰島-01.jpg', '冰島-02.jpg'],

  // 東京
  '東京': ['東京-01.avif', '東京-02.jpg'],

  // 京阪神 (京都、大阪、神戶、關西)
  '京阪神': ['京阪神-01.jpg', '京阪神-02.jpg'],
  '京都': ['京阪神-01.jpg', '京阪神-02.jpg'],
  '大阪': ['京阪神-01.jpg', '京阪神-02.jpg'],
  '神戶': ['京阪神-01.jpg', '京阪神-02.jpg'],
  '關西': ['京阪神-01.jpg', '京阪神-02.jpg'],

  // 沖繩
  '沖繩': ['沖繩-01.jpg', '沖繩-02.jpg'],

  // 首爾
  '首爾': ['首爾-01.jpg', '首爾-02.jpg'],
  '韓國': ['首爾-01.jpg', '首爾-02.jpg'],

  // 曼谷
  '曼谷': ['曼谷-01.jpg', '曼谷-02.jpg'],
  '泰國': ['曼谷-01.jpg', '曼谷-02.jpg'],

  // 倫敦
  '倫敦': ['倫敦-01.jpg', '倫敦-02.jpg'],
  '英國': ['倫敦-01.jpg', '倫敦-02.jpg'],
};

const DEFAULT_IMAGES = ['預設-01.png', '預設-02.png', '預設-03.png'];

/**
 * 取得行程對應的封面圖片路徑
 * 若為預設選單中的選項（如巴黎、冰島、東京、京阪神、沖繩、首爾、曼谷、倫敦等）則顯示對應圖片，
 * 若不是則從預設的三張照片（預設-01, 預設-02, 預設-03）中擇一顯示。
 * 多組圖片時依據種子 (seed/id) 隨機且穩定選擇一張。
 */
export function getDestinationCoverImage(destination?: string, seed?: string): string {
  const dest = (destination || '').trim();
  let candidateList: string[] | null = null;

  for (const [key, images] of Object.entries(DESTINATION_IMAGE_MAP)) {
    if (dest.includes(key) || key.includes(dest)) {
      candidateList = images;
      break;
    }
  }

  if (!candidateList || candidateList.length === 0) {
    candidateList = DEFAULT_IMAGES;
  }

  let index = 0;
  if (seed && seed.length > 0) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    index = hash % candidateList.length;
  } else {
    index = Math.floor(Math.random() * candidateList.length);
  }

  const filename = candidateList[index];

  // 支援 GitHub Pages basePath /planTravel 或本地環境
  const isGitHubPages = typeof window !== 'undefined'
    ? window.location.pathname.includes('/planTravel')
    : process.env.DEPLOY_TARGET === 'gh-pages' || process.env.GITHUB_ACTIONS === 'true';
  const basePath = isGitHubPages ? '/planTravel' : '';

  // 加入時間版本破壞快取 (Cache-Busting)，確保手機瀏覽器不會卡在舊版大圖快取
  return `${basePath}/travel-pic/${encodeURIComponent(filename)}?v=20260925v2`;
}
