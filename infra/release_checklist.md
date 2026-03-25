# Release Checklist

## Automated

1. Run `tests/run_all.sh`
2. Run `infra/release_healthcheck.sh`

## Manual

1. Verify teacher login and dashboard navigation
2. Verify student login and dashboard navigation
3. Upload one teacher file and one student answer
4. Verify analytics pages render charts without lag spikes
5. Verify logout clears access and redirects to auth screen
