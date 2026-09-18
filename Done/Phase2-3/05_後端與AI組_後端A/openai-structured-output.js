/**
 * Atrip LLM Structured Output Orchestrator
 * Ticket: TRACK2-05 (LLM Structured Output / JSON Mode 整合與行李清單生成)
 * Description: Calls OpenAI gpt-4o with response_format json_schema (strict: true),
 * retry logic, timeout control, and validates the parsed itinerary & packing list.
 */

const fs = require('fs');
const path = require('path');

const itinerarySchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'atrip-itinerary-schema.json'), 'utf8')
);

/**
 * Invokes OpenAI chat completion with strict json_schema output
 * @param {Object} params
 * @param {string} params.apiKey - OpenAI API Key
 * @param {string} params.systemPrompt - Master System Prompt (assembled from TRACK2-04)
 * @param {string} params.userPrompt - User preferences prompt directive
 * @param {number} [params.maxRetries=2] - Max retry attempts on 5xx/timeout
 * @param {number} [params.retryDelayMs=3000] - Delay between retries in milliseconds
 * @param {number} [params.timeoutMs=60000] - Timeout per attempt
 * @returns {Promise<Object>} Strictly validated ItineraryPayload
 */
async function generateStructuredItinerary({
  apiKey = process.env.OPENAI_API_KEY,
  systemPrompt,
  userPrompt,
  maxRetries = 2,
  retryDelayMs = 3000,
  timeoutMs = 60000,
}) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for structured output generation.');
  }

  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const requestBody = {
    model: 'gpt-4o',
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: itinerarySchema,
    },
  };

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text();
        const isRetryable = response.status >= 500 || response.status === 429;
        const err = new Error(`OpenAI API error [${response.status}]: ${errorText}`);
        err.status = response.status;
        err.isRetryable = isRetryable;
        throw err;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI response returned empty message content.');
      }

      // Parse JSON directly (strict json_schema guarantees no markdown fencing)
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseErr) {
        throw new Error(`Failed to parse LLM structured output as JSON: ${parseErr.message}`);
      }

      // Basic semantic assertions
      validateItinerarySemantics(parsed);

      return parsed;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const isAbort = err.name === 'AbortError';

      if (attempt < maxRetries && (err.isRetryable || isAbort)) {
        console.warn(`[TRACK2-05] OpenAI attempt ${attempt + 1} failed (${err.message}). Retrying in ${retryDelayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      } else {
        break;
      }
    }
  }

  throw new Error(`[TRACK2-05] OpenAI structured itinerary generation failed after ${maxRetries + 1} attempts: ${lastError.message}`);
}

/**
 * Validates semantic constraints of the parsed payload
 * @param {Object} data - Parsed ItineraryPayload
 */
function validateItinerarySemantics(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Payload must be a non-null object');
  }

  if (!data.meta || typeof data.meta.total_days !== 'number') {
    throw new Error('Missing or invalid meta.total_days');
  }

  if (!Array.isArray(data.daily_itinerary)) {
    throw new Error('daily_itinerary must be an array');
  }

  if (data.daily_itinerary.length !== data.meta.total_days) {
    throw new Error(
      `daily_itinerary length (${data.daily_itinerary.length}) does not match meta.total_days (${data.meta.total_days})`
    );
  }

  // Validate coordinates and activities
  for (const day of data.daily_itinerary) {
    if (!Array.isArray(day.activities)) {
      throw new Error(`Day ${day.day_number} activities must be an array`);
    }
    for (const act of day.activities) {
      if (!act.coordinates || typeof act.coordinates.lat !== 'number' || typeof act.coordinates.lng !== 'number') {
        throw new Error(`Activity ${act.location_name || act.id} has invalid coordinates`);
      }
      if (act.coordinates.lat < -90 || act.coordinates.lat > 90 || act.coordinates.lng < -180 || act.coordinates.lng > 180) {
        throw new Error(`Activity ${act.location_name} coordinates out of earthly bounds`);
      }
    }
  }

  // Validate packing_list
  if (!Array.isArray(data.packing_list) || data.packing_list.length < 5) {
    throw new Error('packing_list must be an array with at least 5 items');
  }

  const validCategories = new Set(['essentials', 'clothing', 'electronics', 'toiletries']);
  for (const item of data.packing_list) {
    if (!validCategories.has(item.category)) {
      throw new Error(`Packing item ${item.item_name} has invalid category: ${item.category}`);
    }
  }
}

module.exports = {
  itinerarySchema,
  generateStructuredItinerary,
  validateItinerarySemantics,
};
