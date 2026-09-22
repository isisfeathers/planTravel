# 1. JSON-First Itinerary Data Model with PostgreSQL JSONB

We chose to persist complete multi-day itineraries as structured `JSONB` documents within a single `itineraries.itinerary_data` column rather than normalizing them into separate tables (`itinerary_days`, `activities`, `transits`, `recommendations`, `packing_list`).

Normalizing a highly dynamic, nested itinerary requires complex multi-table joins, cascading foreign keys, and array-order re-indexing on every drag-and-drop event. Storing the validated itinerary as a `JSONB` payload allows atomic whole-document overwrites with optimistic concurrency control (`version` increment), eliminates relational mapping overhead between LLM structured outputs and the database, and enables zero-transformation client state hydration in the React/Next.js frontend.
