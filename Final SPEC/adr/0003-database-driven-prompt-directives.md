# 3. Database-Driven Dynamic Prompt Directives via prompt_templates

We chose to store modular LLM prompt rules and constraints in a dedicated Supabase PostgreSQL table (`prompt_templates`) rather than hardcoding them within n8n workflow nodes or the frontend codebase.

Hardcoding prompt fragments across automation workflows requires manual redeployment and credentials access whenever travel constraints (such as accommodation check-in rules or transit formatting) are tuned. A database-backed template table allows prompt engineers and product managers to update, prioritize, and A/B test prompt instructions in real time through Supabase Studio, enforces strict fallback defaults when users make zero selections, and shields prompt engineering intellectual property from client-side exposure.
