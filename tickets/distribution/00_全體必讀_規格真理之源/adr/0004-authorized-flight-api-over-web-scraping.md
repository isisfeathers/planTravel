# 4. Authorized Flight Shopping APIs and Deep Link Redirection over Web Scraping

We chose to integrate authorized Flight Shopping APIs (Amadeus, Skyscanner) and affiliate deep linking rather than scraping consumer flight portals (Google Flights, OTA websites, or airline booking engines).

Scraping consumer flight websites exposes the system to aggressive bot mitigation (Cloudflare, Akamai, CAPTCHAs), frequent breaking DOM changes, IP bans, and serious terms of service (TOS) legal liabilities. Building a provider-neutral Adapter architecture with short-term caching (Redis, TTL 20 mins) and price verification ensures legal compliance, high query availability, reliable fare normalization, and zero payment/ticketing liabilities by routing users to official airline/OTA checkout pages via authorized deep links.
