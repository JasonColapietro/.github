#!/bin/sh
# Local demo recording: run a phase of scripts/local-brightside-seed.ts against the local demo DB.
cd "${STUDIO:-../suede-agent-studio}" || exit 1
AGENT_STUDIO_DB_SECRET="$(grep '^AGENT_STUDIO_DB_SECRET=' .env.local | cut -d= -f2-)" \
SQLITE_PATH="$PWD/agency-demo.db" DEMO_EMAIL=demo@suedeai.ai \
CV_OUT="${SCRATCH:-$PWD}"/cv.txt \
npx vite-node --config vitest.config.ts scripts/local-brightside-seed.ts "$1"
