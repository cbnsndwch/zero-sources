# ✅ Zero Get-Queries Configuration Checklist

Use this checklist to verify the Zero get-queries configuration is complete and correct.

## Pre-Configuration

- [ ] MongoDB is running and accessible
- [ ] ZRocket API is configured and can connect to MongoDB
- [ ] Zero Cache dependencies are built (`pnpm build:libs`)

## Configuration Files

- [x] `apps/source-mongodb-server/.env` contains `ZERO_GET_QUERIES_URL`
- [x] `apps/zrocket/.env` contains `ZERO_GET_QUERIES_URL`
- [x] Both URLs point to same endpoint: `http://localhost:8011/api/zero/get-queries`
- [x] Port 8011 matches the `PORT` variable in `apps/zrocket/.env`

## Verification

- [x] Run `.\tools\verify-get-queries-config.ps1` - Configuration checks pass
- [ ] Start Zero Cache - Service starts without errors
- [ ] Start ZRocket API - Service starts without errors
- [ ] Run verification again - Service connectivity checks pass

## Testing

- [ ] Run `.\tools\test-get-queries-endpoint.ps1` - Basic tests pass
- [ ] Test with empty queries - Returns 200 OK
- [ ] Test with authentication - JWT is processed correctly
- [ ] Test with invalid request - Returns 400 Bad Request
- [ ] Performance test - Average response time < 100ms

## Logs

- [ ] Zero Cache logs show `GET_QUERIES_URL` configuration
- [ ] Zero Cache logs show successful connection attempts
- [ ] ZRocket API logs show incoming requests from Zero Cache
- [ ] No errors in either service logs

## Integration

- [ ] Client can connect to Zero Cache via WebSocket
- [ ] Client queries are forwarded to ZRocket API
- [ ] API returns filtered results
- [ ] Zero Cache executes filtered queries
- [ ] Client receives correct data
- [ ] Real-time updates work correctly

## Production Readiness

- [ ] `ZERO_GET_QUERIES_URL` updated for production hostname
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules allow traffic between services
- [ ] Health check endpoints return 200 OK
- [ ] Monitoring and alerting configured
- [ ] Load testing completed
- [ ] Error handling tested and verified

## Documentation

- [x] Configuration documented in README
- [x] Setup guide created (`ZERO_GET_QUERIES_SETUP.md`)
- [x] Quick reference created (`GET_QUERIES_QUICK_REFERENCE.md`)
- [x] Verification script documented
- [x] Test script documented
- [ ] Team trained on configuration
- [ ] Runbook created for common issues

## Security

- [ ] JWT secret configured correctly (`ZERO_AUTH_SECRET`)
- [ ] JWT tokens validated on every request
- [ ] Authorization logic implemented
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] No sensitive data in logs
- [ ] Security scan completed

## Performance

- [ ] MongoDB indexes created for filtered fields
- [ ] Connection pooling configured
- [ ] Query timeout set appropriately
- [ ] Cache warming strategy implemented (if needed)
- [ ] Load testing completed
- [ ] Performance monitoring enabled

## Rollback Plan

- [ ] Previous configuration backed up
- [ ] Rollback procedure documented
- [ ] Feature flag implemented (optional)
- [ ] Emergency contact list updated

---

## Status: Configuration Phase Complete ✅

**Next Phase**: Handler Implementation

The configuration is complete and verified. The next step is to implement the actual get-queries handler that will process the forwarded requests.

**Blockers**: None

**Ready for**: Handler implementation (User Story ZSQ-006)

---

## Notes

- Configuration phase items marked with [x] are complete
- Service-dependent items marked with [ ] will be completed once services are running
- Production items marked with [ ] will be completed during deployment phase

---

_Last Updated: {{ current_date }}_
