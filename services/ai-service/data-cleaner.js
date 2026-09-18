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
