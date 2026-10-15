#!/bin/sh
set -e
pnpm exec wrangler d1 migrations apply hvisk --local --persist-to /data
exec pnpm exec wrangler dev --ip 0.0.0.0 --port 8787 --persist-to /data --test-scheduled
