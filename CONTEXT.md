# Atrip Domain Model

The ubiquitous language and domain model for the AI-powered travel assistant (Atrip, Project Atrip), integrating LINE Web App (LIFF), Supabase, n8n, and LLM structured outputs.

## Language

### Core Entities

**Itinerary**:
A planned multi-day journey containing daily timelines, transportation routes, lodging, and recommendations.
_Avoid_: Trip, Schedule, Tour

**Day Plan**:
A single calendar day's itinerary within an Itinerary, containing an ordered sequence of Activity Items.
_Avoid_: Daily schedule, Day itinerary

**Activity Item**:
A scheduled point of interest, dining experience, or activity within a Day Plan, complete with coordinates, duration, and transit instructions.
_Avoid_: Event, Stop, Spot, Point

**Basecamp**:
The primary lodging location acting as the fixed daily departure and return origin under a single-hotel strategy.
_Avoid_: Hotel, Lodging stop

**Anchor Event**:
An immovable, time-fixed event (such as a sports match, concert, or booked tour) around which the surrounding activities for that day are structured.
_Avoid_: Main event, Highlight, Fixed event

**Itinerary Job**:
An asynchronous background task tracking the multi-step generation pipeline (flight querying, LLM generation, validation) with idempotency and retry controls.
_Avoid_: Background task, Async worker, Generation request

**Flight Offer**:
A normalized, deduplicated, and scored flight itinerary option provided by the Flight Data Acquisition Service, linked to an official booking deep link.
_Avoid_: Flight ticket, Airfare result, Crawler result

**Packing Item**:
A discrete recommended item within the Packing List generated dynamically based on destination climate, trip duration, and planned activities.
_Avoid_: Luggage item, Packing checklist item

### Configuration & Preferences

**Preference Snapshot**:
An immutable record of traveler choices (destination, duration, pace, budget, transit mode, and interest tags) bound to an Itinerary.
_Avoid_: Form data, Questionnaire result, Survey answer

**Preset Bundle**:
A curated, pre-selected collection of travel preferences and tags designed for zero-click instant itinerary generation.
_Avoid_: Template, Package, Preset

**Prompt Directive**:
A modular, database-persisted instruction dynamically injected into the LLM master prompt based on selected preference tags.
_Avoid_: Prompt text, Prompt rule, Instruction snippet

### Lifecycle, Architecture & Sharing

**Active Itinerary**:
The single Itinerary currently marked as focused by a user, serving as the active conversational context for the LINE Chatbot.
_Avoid_: Current trip, Selected itinerary, Primary schedule

**Search Orchestrator**:
The flight service component coordinating provider adapters, timeout budgets, caching, and circuit breakers.
_Avoid_: Flight crawler, Flight search engine

**Fork**:
The action and result of cloning a publicly shared Itinerary into an independent, privately editable Itinerary under the copier's account.
_Avoid_: Clone, Duplicate, Copy

**Share Token**:
A unique UUID allowing public, unauthenticated, read-only viewing of an Itinerary with creator privacy de-identification.
_Avoid_: Share link, Access code, Public ID
