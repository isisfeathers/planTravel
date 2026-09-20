import { randomUUID } from "crypto";

const DEFAULT_PACKING_ITEMS: Record<string, Array<{ item_name: string; notes: string }>> = {
  essentials: [
    { item_name: '護照正本（效期6個月以上）與入境申報碼', notes: '隨身攜帶勿托運' },
    { item_name: '海外高回饋信用卡與當地貨幣現鈔', notes: '應急金流備用' },
    { item_name: '機票電子憑證與住宿確認單', notes: '手機截圖離線備份' },
  ],
  clothing: [
    { item_name: '舒適好走防滑健步鞋', notes: '每日萬步自由行必備' },
    { item_name: '防風保暖/透氣外套與換洗衣物', notes: '因應早晚溫差與天氣' },
    { item_name: '輕量折疊晴雨兩用傘', notes: '隨身攜帶' },
  ],
  electronics: [
    { item_name: '大容量行動電源 (需隨身攜帶)', notes: '嚴禁放入托運行李' },
    { item_name: '該國專用規格萬國轉接插頭', notes: '飯店充電必備' },
    { item_name: '當地上網 eSIM / 實體 SIM 卡', notes: '出發前開通測試' },
    { item_name: 'Type-C 快充線與多孔充電頭', notes: '多設備充電' },
  ],
  toiletries: [
    { item_name: '個人常備用藥（止痛/腸胃/暈車藥）', notes: '隨身備用' },
    { item_name: '旅行分裝盥洗包與保濕護唇膏', notes: '隨身液體需小於100ml' },
    { item_name: '高係數防曬乳與隨身濕紙巾', notes: '戶外活動防護' },
  ]
};

export function buildSystemPrompt(dest: string, days: number, startDate?: string, endDate?: string): string {
  const dateGuide = startDate && endDate
    ? `【出發與回程日期】指定出發日期為 ${startDate}，回程日期為 ${endDate}（共 ${days} 天）。每日 date_label 必須為真實日期格式（例如：${startDate} (Day 1) · 抵達與核心探索）。`
    : `【出發與回程日期】用戶選擇彈性時機，請由 AI 為 ${dest} 安排最合適出發季節與近期週六出發的完整 ${days} 天真實日期（例如：2026-10-17 (Day 1)）。`;

  return `你是 Atrip 頂級 AI 自由行旅遊管家。請根據目的地、出發日期與天數，產出結合真實航班起降時段的地理行程與 4 大類完整行李打包清單。

${dateGuide}

【航班時段與行程無縫銜接規則】
1. Day 1 第一天：第一個行程必須是「航班抵達與機場接駁/飯店 Check-in」（例如搭乘早班機 08:30-12:45 抵達當地，13:30 前往市區飯店放行李，下午正式展開行程）。
2. Day ${days} 最後一天：最後一個行程必須保留提早 2.5~3 小時「前往機場辦理登機退稅與搭機返台」（例如搭乘 18:30 班機返台）。

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
          "location_name": "真實景點或飯店全名",
          "category": "sightseeing",
          "duration_minutes": 90,
          "description": "遊覽特色或入住登記。",
          "coordinates": { "lat": 35.7147, "lng": 139.7967 },
          "cost_estimate": 500,
          "tips": "配合早班機抵達之實用技巧。",
          "transit_to_next": { "mode": "subway", "duration_minutes": 15, "route_name": "地鐵/巴士路線", "instructions": "從 A 站搭乘 X 線至 B 站" }
        }
      ]
    }
  ],
  "transit_overview": { "primary_mode": "public_transit", "summary": "交通概況", "recommendations": ["推薦交通日票", "乘車秘訣"] },
  "recommendations": { "dining": ["必吃名店 1", "必吃名店 2"], "notes": "注意事項" },
  "packing_list": [
    { "category": "essentials", "item_name": "護照正本（效期6個月以上）與入境申報碼", "is_checked": false, "notes": "隨身攜帶勿托運" },
    { "category": "essentials", "item_name": "海外高回饋雙幣信用卡與當地現鈔", "is_checked": false, "notes": "備用應急資金" },
    { "category": "clothing", "item_name": "配合當地氣候的透氣排汗衫與好走健步鞋", "is_checked": false, "notes": "每日萬步健走必備" },
    { "category": "clothing", "item_name": "防風保暖外套或折疊雨傘", "is_checked": false, "notes": "因應早晚溫差與天氣" },
    { "category": "electronics", "item_name": "大容量行動電源與該國專用規格轉接插頭", "is_checked": false, "notes": "行動電源需放隨身行李" },
    { "category": "electronics", "item_name": "當地上網 eSIM / 實體 SIM 卡與快充線組", "is_checked": false, "notes": "出發前完成開通" },
    { "category": "toiletries", "item_name": "個人常備用藥（止痛/胃腸藥/暈車藥）", "is_checked": false, "notes": "隨身備用" },
    { "category": "toiletries", "item_name": "旅行分裝盥洗包、保濕乳液與防曬乳", "is_checked": false, "notes": "隨身攜帶需小於100ml" }
  ]
}

【核心要求】
1. 純 JSON 輸出，不得包含 markdown。
2. daily_itinerary 必須為完整 ${days} 天行程，每日 date_label 必須包含實際日期與星期。
3. packing_list 必須包含全部 4 大類別（essentials, clothing, electronics, toiletries）。`;
}

export function normalizePayload(payload: any, startDate?: string, endDate?: string) {
  if (!payload.meta) payload.meta = {};
  if (startDate) payload.meta.start_date = startDate;
  if (endDate) payload.meta.end_date = endDate;

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
        });
      }
    });
  }

  const normalizedList: any[] = [];
  const categoriesPresent = new Set<string>();

  if (Array.isArray(payload.packing_list)) {
    payload.packing_list.forEach((item: any, idx: number) => {
      let cat = String(item.category || 'essentials').toLowerCase();
      if (cat === 'essential' || cat === 'document' || cat === 'documents') cat = 'essentials';
      if (cat === 'clothes') cat = 'clothing';
      if (cat === 'electronic' || cat === 'tech' || cat === 'digital') cat = 'electronics';
      if (cat === 'toiletry' || cat === 'medicine' || cat === 'medical') cat = 'toiletries';
      if (!['essentials', 'clothing', 'electronics', 'toiletries'].includes(cat)) cat = 'essentials';

      categoriesPresent.add(cat);
      normalizedList.push({
        id: item.id || `pack-${cat}-${idx + 1}-${randomUUID().slice(0, 6)}`,
        category: cat,
        item_name: item.item_name || item.item || item.name || '必備物品',
        is_checked: Boolean(item.is_checked || item.packed),
        notes: item.notes || item.tips || ''
      });
    });
  }

  // 若 LLM 遺漏了任何分類，自動補充該分類專屬精選項目
  const allCategories = ['essentials', 'clothing', 'electronics', 'toiletries'];
  allCategories.forEach((cat) => {
    if (!categoriesPresent.has(cat)) {
      const defaults = DEFAULT_PACKING_ITEMS[cat] || [];
      defaults.forEach((def, dIdx) => {
        normalizedList.push({
          id: `pack-${cat}-def-${dIdx + 1}-${randomUUID().slice(0, 6)}`,
          category: cat,
          item_name: def.item_name,
          is_checked: false,
          notes: def.notes
        });
      });
    }
  });

  payload.packing_list = normalizedList;
  return payload;
}



