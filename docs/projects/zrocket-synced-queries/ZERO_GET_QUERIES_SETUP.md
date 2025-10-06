# Zero Get-Queries Configuration Guide

## Overview

This guide explains how to configure Zero-cache to forward query requests to the ZRocket NestJS API for server-side filtering and permission enforcement.

## Architecture

```
┌─────────────┐
│   Client    │ 
│  (React)    │ Sends query with args
└──────┬──────┘
       │
       │ WebSocket
       ▼
┌─────────────┐
│ Zero Cache  │ Port: 4848
│ (Container) │ Forwards HTTP POST
└──────┬──────┘
       │
       │ ZERO_GET_QUERIES_URL
       │ http://localhost:8011/api/zero/get-queries
       ▼
┌─────────────┐
│   ZRocket   │ Port: 8011
│   NestJS    │ Processes queries
│    API      │ Returns filtered results
└─────────────┘
```

## Environment Variables

### Required Configuration

**For Zero Cache** (`apps/source-mongodb-server/.env`):

```bash
# Forward get-queries requests to ZRocket NestJS API
ZERO_GET_QUERIES_URL='http://localhost:8011/api/zero/get-queries'
```

**For ZRocket App** (`apps/zrocket/.env`):

```bash
# Documentation - this URL is where zero-cache will forward requests
# Must match the endpoint in zero-queries.controller.ts
ZERO_GET_QUERIES_URL='http://localhost:8011/api/zero/get-queries'

# ZRocket app server port (must match URL above)
PORT=8011
```

### Production Configuration

For production, update the hostname:

```bash
# Production example
ZERO_GET_QUERIES_URL='https://api.yourapp.com/api/zero/get-queries'
```

## Verification Steps

### 1. Start Services

Start all services in order:

```bash
# Terminal 1: Start MongoDB
npm run dev:db-up

# Terminal 2: Start Zero Cache
cd apps/source-mongodb-server
pnpm dev

# Terminal 3: Start ZRocket API
cd apps/zrocket
pnpm dev:server

# Terminal 4: Start ZRocket UI (optional)
cd apps/zrocket
pnpm dev:client
```

### 2. Check Zero Cache Logs

Look for successful connection to get-queries endpoint in the zero-cache logs:

```
[Zero Cache] Starting up...
[Zero Cache] GET_QUERIES_URL: http://localhost:8011/api/zero/get-queries
[Zero Cache] Ready to forward query requests
```

### 3. Verify API Endpoint

Test the endpoint directly:

```powershell
# Test with curl (PowerShell)
curl -Method POST `
  -Uri "http://localhost:8011/api/zero/get-queries" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"queries":[]}'
```

Expected response:
```json
{
  "queries": []
}
```

### 4. Health Check

Verify both services are running:

```powershell
# Check Zero Cache
curl http://localhost:4848

# Check ZRocket API
curl http://localhost:8011/health
```

## Testing the Integration

### Test 1: Basic Query Forwarding

1. Open the ZRocket UI in a browser
2. Open browser DevTools → Network tab
3. Look for WebSocket connections to `ws://localhost:4848`
4. Look for query requests being sent

### Test 2: Authentication Flow

1. Login to ZRocket
2. Watch the zero-cache logs for query forwarding
3. Check that JWT is being passed correctly
4. Verify filtered results are returned

### Test 3: Permission Enforcement

1. Try accessing a private room as an unauthorized user
2. Verify the query returns empty results (not an error)
3. Add user to room membership
4. Verify the room now appears in results

## Common Issues

### Issue: Connection Refused

**Symptoms:**
```
[Zero Cache] Error forwarding query: ECONNREFUSED
```

**Solutions:**
1. Verify ZRocket API is running on port 8011
2. Check firewall settings
3. Ensure `ZERO_GET_QUERIES_URL` uses correct hostname

### Issue: 404 Not Found

**Symptoms:**
```
[Zero Cache] HTTP 404 from get-queries endpoint
```

**Solutions:**
1. Verify endpoint exists in `zero-queries.controller.ts`
2. Check route registration in module
3. Ensure API prefix matches (`/api/zero/get-queries`)

### Issue: Authentication Errors

**Symptoms:**
```
[ZRocket API] JWT verification failed
```

**Solutions:**
1. Verify `ZERO_AUTH_SECRET` matches in both services
2. Check JWT is being passed in request headers
3. Validate JWT format and expiration

### Issue: Timeout

**Symptoms:**
```
[Zero Cache] Request timeout waiting for get-queries
```

**Solutions:**
1. Check ZRocket API logs for errors
2. Verify database connectivity
3. Check query performance (should be < 100ms)
4. Increase timeout if needed (not recommended)

## Monitoring

### Key Metrics to Watch

1. **Query Latency**: Time to process get-queries requests
2. **Error Rate**: Failed query forwarding attempts
3. **Connection Health**: WebSocket connections between client and zero-cache
4. **API Response Time**: ZRocket API processing time

### Log Locations

- **Zero Cache**: Console output or container logs
- **ZRocket API**: `logs/` directory or console output
- **Client**: Browser DevTools → Console

### Sample Log Entries

**Successful query:**
```
[Zero Cache] Forwarding query: myChats
[ZRocket API] Processing query: myChats for user: abc123
[ZRocket API] Query result: 5 rooms returned
[Zero Cache] Query response: 200 OK
```

**Failed query:**
```
[Zero Cache] Forwarding query: myChats
[ZRocket API] Error processing query: User not authenticated
[Zero Cache] Query response: 401 Unauthorized
```

## Security Considerations

### Authentication

- JWT tokens are validated on every request
- Tokens must include `sub` claim with user ID
- Invalid tokens result in empty results (not errors)

### Authorization

- Server-side filtering prevents client bypass
- Queries are executed with user context
- No sensitive data in error messages

### Network Security

- Use HTTPS in production
- Implement rate limiting on get-queries endpoint
- Monitor for suspicious query patterns

## Performance Optimization

### Best Practices

1. **Index MongoDB Fields**: Ensure `memberIds` has an index
2. **Cache Results**: Consider Redis for frequently-accessed queries
3. **Connection Pooling**: Use appropriate pool sizes
4. **Query Timeout**: Set reasonable timeout (100-500ms)

### Monitoring Performance

```typescript
// Add timing to queries
const start = Date.now();
const result = await processQuery(query, context);
const duration = Date.now() - start;

if (duration > 100) {
  logger.warn(`Slow query: ${query.name} took ${duration}ms`);
}
```

## Rollback Plan

If issues occur in production:

1. **Immediate**: Set `ZERO_GET_QUERIES_URL=""` to disable synced queries
2. **Fallback**: Revert to previous deployment
3. **Debug**: Check logs for specific errors
4. **Fix**: Address issues in staging before re-deploying

## Next Steps

After configuration is complete:

1. ✅ Implement query handlers (see `SYNCED_QUERIES_IMPLEMENTATION.md`)
2. ✅ Add permission enforcement logic
3. ✅ Write integration tests
4. ✅ Deploy to staging
5. ✅ Monitor and optimize
6. ✅ Deploy to production

## Additional Resources

- [Zero Synced Queries Documentation](https://zero.rocicorp.dev/docs/synced-queries)
- [PRD: ZRocket Synced Queries](./PRD.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Testing Strategy](./TESTING_STRATEGY.md)

## Support

For issues or questions:

1. Check logs in both services
2. Review this troubleshooting guide
3. Consult Zero documentation
4. Create an issue in the repository
