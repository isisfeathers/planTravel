#!/bin/bash
export $(grep -v '^#' .env.n8n | xargs)
npx --yes n8n@2.35.3 import:workflow --input=n8n/atrip_main_workflow_merged.json
