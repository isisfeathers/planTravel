#!/bin/bash
export $(grep -v '^#' .env.n8n | xargs)
export N8N_PORT=5678
npx --yes n8n@2.35.3 start
