/**
 * Test script for TRACK2-05 OpenAI Structured Output
 * Tests schema adherence and semantic validation using Node.js
 */

const fs = require('fs');
const path = require('path');
const { itinerarySchema, validateItinerarySemantics } = require('./openai-structured-output');

console.log('🧪 Running TRACK2-05 Structured Output Validation Tests...');

// 1. Load mock itinerary
const mockPath = path.resolve(__dirname, '../../tickets/mocks/mock_itinerary.json');
const mockRaw = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
const itineraryData = mockRaw.itinerary_data || mockRaw;

// Test 1: Valid mock payload validation
try {
  validateItinerarySemantics(itineraryData);
  console.log('✅ Test 1: Mock itinerary data passed semantic validation.');
} catch (err) {
  console.error('❌ Test 1 Failed:', err.message);
  process.exit(1);
}

// Test 2: Mismatched days assertion
try {
  const badData = JSON.parse(JSON.stringify(itineraryData));
  badData.meta.total_days = 99;
  validateItinerarySemantics(badData);
  console.error('❌ Test 2 Failed: Should have rejected mismatched total_days');
  process.exit(1);
} catch (err) {
  console.log('✅ Test 2: Successfully caught mismatched total_days:', err.message);
}

// Test 3: Invalid coordinates assertion
try {
  const badData = JSON.parse(JSON.stringify(itineraryData));
  badData.daily_itinerary[0].activities[0].coordinates.lat = 150; // invalid latitude
  validateItinerarySemantics(badData);
  console.error('❌ Test 3 Failed: Should have rejected invalid latitude');
  process.exit(1);
} catch (err) {
  console.log('✅ Test 3: Successfully caught invalid coordinates:', err.message);
}

// Test 4: Packing list too short assertion
try {
  const badData = JSON.parse(JSON.stringify(itineraryData));
  badData.packing_list = badData.packing_list.slice(0, 2);
  validateItinerarySemantics(badData);
  console.error('❌ Test 4 Failed: Should have rejected packing list with < 5 items');
  process.exit(1);
} catch (err) {
  console.log('✅ Test 4: Successfully caught insufficient packing list items:', err.message);
}

// Test 5: Verify schema strictness & structure
if (!itinerarySchema.name || itinerarySchema.strict !== true) {
  console.error('❌ Test 5 Failed: Schema must have strict: true');
  process.exit(1);
}
if (!itinerarySchema.schema || itinerarySchema.schema.additionalProperties !== false) {
  console.error('❌ Test 5 Failed: Root schema must set additionalProperties: false');
  process.exit(1);
}
console.log('✅ Test 5: Schema strictness and root restrictions verified.');

console.log('\n🎉 ALL TRACK2-05 TESTS PASSED SUCCESSFULLY (5/5)!');
