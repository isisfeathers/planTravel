/**
 * Atrip n8n Data Cleaning, ID Injection & Persistence Helper
 * Ticket: TRACK2-06 (n8n 資料清洗、ID 注入、原子性寫入與異常重試機制)
 * Description: Cleans and injects unique UUIDs to daily activities, merges AFS flight offers,
 * and formats atomic database updates or failure rollbacks for Supabase.
 */

const { randomUUID } = require('crypto');

/**
 * Clean itinerary payload and ensure every activity has a globally unique ID
 * @param {Object} rawItinerary - Parsed LLM ItineraryPayload
 * @returns {Object} Cleaned ItineraryPayload
 */
function cleanAndInjectActivityIds(rawItinerary) {
  if (!rawItinerary || typeof rawItinerary !== 'object') {
    throw new Error('Invalid rawItinerary provided.');
  }

  const cleaned = JSON.parse(JSON.stringify(rawItinerary));

  if (!Array.isArray(cleaned.daily_itinerary)) {
    throw new Error('daily_itinerary must be an array.');
  }

  const seenIds = new Set();

  cleaned.daily_itinerary.forEach((day, dayIndex) => {
    const dayNum = day.day_number || dayIndex + 1;
    if (Array.isArray(day.activities)) {
      day.activities.forEach((activity, actIndex) => {
        // If ID is missing or duplicated, inject a collision-free UUID
        if (!activity.id || typeof activity.id !== 'string' || seenIds.has(activity.id)) {
          const suffix = randomUUID().replace(/-/g, '').slice(0, 8);
          activity.id = `act-d${dayNum}-${actIndex + 1}-${suffix}`;
        }
        seenIds.add(activity.id);

        // Sanitize coordinates to standard numbers
        if (activity.coordinates) {
          activity.coordinates.lat = Number(activity.coordinates.lat);
          activity.coordinates.lng = Number(activity.coordinates.lng);
        }

        // Sanitize duration and cost
        activity.duration_minutes = Number(activity.duration_minutes) || 60;
        activity.cost_estimate = Number(activity.cost_estimate) || 0;
      });
    }
  });

  // 2. 智能行李打包清單標準化與 ID 注入 (優先保留 LLM 生成的客製項目)
  const validCategories = ['essentials', 'clothing', 'electronics', 'toiletries'];
  const DEFAULT_FALLBACKS = {
    essentials: [
      { item_name: '護照正本（效期6個月以上）與入境申報單', notes: '隨身攜帶勿托運' },
      { item_name: '海外高回饋信用卡與當地貨幣現鈔', notes: '應急金流備用' },
    ],
    clothing: [
      { item_name: '舒適好走防滑健步鞋', notes: '每日萬步自由行必備' },
      { item_name: '防風保暖外套與換洗衣物', notes: '因應早晚溫差與氣候變化' },
    ],
    electronics: [
      { item_name: '大容量行動電源 (需隨身攜帶)', notes: '拍照與地圖導航必備，嚴禁托運' },
      { item_name: '萬國通用規格轉接插頭與多孔快充線組', notes: '充電必備' },
    ],
    toiletries: [
      { item_name: '個人常備藥（止痛/胃腸藥/暈車藥）', notes: '隨身備用' },
      { item_name: '旅行分裝便攜盥洗包與保濕防曬乳', notes: '隨身液體小於100ml' },
    ],
  };

  const normalizedPacking = [];
  const existingCategoryCounts = { essentials: 0, clothing: 0, electronics: 0, toiletries: 0 };

  if (Array.isArray(cleaned.packing_list)) {
    cleaned.packing_list.forEach((item, idx) => {
      let cat = String(item.category || 'essentials').toLowerCase().trim();
      if (cat === 'essential' || cat === 'documents' || cat === 'document') cat = 'essentials';
      if (cat === 'clothes') cat = 'clothing';
      if (cat === 'electronic' || cat === 'tech' || cat === 'digital') cat = 'electronics';
      if (cat === 'toiletry' || cat === 'medicine' || cat === 'medical') cat = 'toiletries';
      if (!validCategories.includes(cat)) cat = 'essentials';

      const itemName = String(item.item_name || item.name || '').trim();
      if (!itemName) return;

      const suffix = randomUUID().replace(/-/g, '').slice(0, 6);
      normalizedPacking.push({
        id: item.id || `pack-${cat}-${idx + 1}-${suffix}`,
        category: cat,
        item_name: itemName,
        is_checked: Boolean(item.is_checked),
        notes: item.notes || '自由行專屬推薦',
      });
      existingCategoryCounts[cat]++;
    });
  }

  // 若某類別項目不足 2 項，補充預設項目防呆
  validCategories.forEach((cat) => {
    if (existingCategoryCounts[cat] < 2) {
      const fallbacks = DEFAULT_FALLBACKS[cat] || [];
      fallbacks.forEach((fb, fbIdx) => {
        const isDuplicate = normalizedPacking.some((i) => i.item_name.includes(fb.item_name.slice(0, 4)));
        if (!isDuplicate && normalizedPacking.filter((i) => i.category === cat).length < 3) {
          const suffix = randomUUID().replace(/-/g, '').slice(0, 6);
          normalizedPacking.push({
            id: `pack-${cat}-fb-${fbIdx + 1}-${suffix}`,
            category: cat,
            item_name: fb.item_name,
            is_checked: false,
            notes: fb.notes,
          });
        }
      });
    }
  });

  cleaned.packing_list = normalizedPacking;

  return cleaned;
}

/**
 * Prepares the payload for completing an itinerary and its background job
 * @param {Object} params
 * @param {string} params.itineraryId - Target itinerary UUID
 * @param {string} params.jobId - Target job UUID
 * @param {Object} params.itineraryPayload - Cleaned ItineraryPayload
 * @param {Array} [params.flightData=[]] - Array of FlightOfferItem
 * @returns {Object} Ready-to-execute Supabase update queries/payloads
 */
function prepareCompletionPayloads({
  itineraryId,
  jobId,
  itineraryPayload,
  flightData = [],
}) {
  if (!itineraryId || !jobId) {
    throw new Error('Both itineraryId and jobId are required.');
  }

  const cleanedItinerary = cleanAndInjectActivityIds(itineraryPayload);

  return {
    itinerariesUpdate: {
      id: itineraryId,
      status: 'completed',
      itinerary_data: cleanedItinerary,
      flight_data: Array.isArray(flightData) ? flightData : [],
      updated_at: new Date().toISOString(),
    },
    itineraryJobsUpdate: {
      id: jobId,
      status: 'completed',
      completed_at: new Date().toISOString(),
      error_code: null,
      error_message: null,
    },
  };
}

/**
 * Prepares the payload for recording a failure in itinerary and background job
 * @param {Object} params
 * @param {string} params.itineraryId - Target itinerary UUID
 * @param {string} params.jobId - Target job UUID
 * @param {string} params.errorCode - Error code classification (e.g. 'LLM_TIMEOUT', 'QUOTA_EXCEEDED')
 * @param {string} params.errorMessage - Detailed error message
 * @returns {Object} Ready-to-execute Supabase update queries/payloads
 */
function prepareFailurePayloads({
  itineraryId,
  jobId,
  errorCode = 'PIPELINE_ERROR',
  errorMessage = 'Generation pipeline encountered an unexpected error.',
}) {
  return {
    itinerariesUpdate: {
      id: itineraryId,
      status: 'failed',
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    },
    itineraryJobsUpdate: {
      id: jobId,
      status: 'failed',
      error_code: errorCode,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    },
  };
}

module.exports = {
  cleanAndInjectActivityIds,
  prepareCompletionPayloads,
  prepareFailurePayloads,
};
