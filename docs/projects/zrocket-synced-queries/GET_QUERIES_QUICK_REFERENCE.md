# 🚀 Zero Get-Queries Quick Reference

## Environment Variables

```bash
# apps/source-mongodb-server/.env (Zero Cache)
ZERO_GET_QUERIES_URL='http://localhost:8011/api/zero/get-queries'

# apps/zrocket/.env (ZRocket API)
ZERO_GET_QUERIES_URL='http://localhost:8011/api/zero/get-queries'
PORT=8011
```

## Quick Commands

```bash
# Verify configuration
.\tools\verify-get-queries-config.ps1

# Test endpoint (once running)
.\tools\test-get-queries-endpoint.ps1

# Test with JWT token
.\tools\test-get-queries-endpoint.ps1 -Token "your-jwt-token"
```

## Start Services

```bash
# Terminal 1: Zero Cache
cd apps/source-mongodb-server
pnpm dev

# Terminal 2: ZRocket API
cd apps/zrocket
pnpm dev:server
```

## Health Checks

```bash
# Zero Cache
curl http://localhost:4848

# ZRocket API
curl http://localhost:8011/health

# Get-Queries Endpoint
curl -X POST http://localhost:8011/api/zero/get-queries `
  -H "Content-Type: application/json" `
  -d '{"queries":[]}'
```

## Architecture Flow

```
Client → Zero Cache (4848) → HTTP POST → ZRocket API (8011)
         WebSocket            /api/zero/get-queries
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check ZRocket API is running on port 8011 |
| 404 Not Found | Verify handler is implemented and registered |
| 401 Unauthorized | Check JWT token is valid |
| Timeout | Check API logs for errors |

## Key Files

- Config: `apps/source-mongodb-server/.env`
- Config: `apps/zrocket/.env`
- Docs: `docs/projects/zrocket-synced-queries/ZERO_GET_QUERIES_SETUP.md`
- Verify: `tools/verify-get-queries-config.ps1`
- Test: `tools/test-get-queries-endpoint.ps1`

## Next Steps

1. Implement `GetQueriesHandler` service
2. Create `POST /api/zero/get-queries` endpoint
3. Add authentication and permission filtering
4. Test with real queries

## Documentation

Full docs: `docs/projects/zrocket-synced-queries/ZERO_GET_QUERIES_SETUP.md`
