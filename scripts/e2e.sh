#!/usr/bin/env bash
# Run Playwright on at most 6 cores at low priority, on a private port and output folder.
# Usage: scripts/e2e.sh tests/rides.spec.ts --project=desktop
# E2E_WORKERS (default 1) sets parallelism; PORT (default random 5300-5899) sets the dev server port.
export PORT="${PORT:-$((5300 + RANDOM % 600))}"
export E2E_WORKERS="${E2E_WORKERS:-1}"
exec nice -n 10 taskset -c 0-5 npx playwright test "$@"
