# Complete Script to create ALL GitHub issues for ZRocket Synced Queries project
# Requires: GitHub CLI (gh) installed and authenticated
# Usage: .\create-all-zsq-issues.ps1

param(
    [string]$Owner = "cbnsndwch",
    [string]$Repo = "zero-sources",
    [string]$ProjectNumber = "4"
)

$ErrorActionPreference = "Stop"

# Check if GitHub CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
    exit 1
}

# Check if authenticated
try {
    $null = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
} catch {
    Write-Error "Not authenticated with GitHub CLI. Please run 'gh auth login'"
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ZRocket Synced Queries - Issue Creator" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will create:" -ForegroundColor Yellow
Write-Host "  - 5 Epic issues" -ForegroundColor White
Write-Host "  - 36 User Story issues" -ForegroundColor White
Write-Host "  - All will be added to project #$ProjectNumber`n" -ForegroundColor White

$confirmation = Read-Host "Do you want to proceed? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

# Store created issue numbers for linking
$issues = @{}

# Function to create an issue
function New-GitHubIssue {
    param(
        [string]$Key,
        [string]$Title,
        [string]$Body,
        [string[]]$Labels,
        [string]$ParentEpic = $null
    )
    
    Write-Host "Creating: $Title" -ForegroundColor Yellow
    
    # Add parent epic reference if provided
    if ($ParentEpic -and $issues.ContainsKey($ParentEpic)) {
        $Body = $Body + "`n`n---`n### Epic`n`nPart of #$($issues[$ParentEpic])"
    }
    
    $labelArgs = $Labels | ForEach-Object { "--label", $_ }
    $args = @("issue", "create", "--repo", "$Owner/$Repo", "--title", $Title, "--body", $Body) + $labelArgs
    
    try {
        $issueUrl = & gh @args 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $issueNumber = $issueUrl -replace ".*\/(\d+)$", '$1'
            $issues[$Key] = $issueNumber
            
            # Add to project
            try {
                $null = gh project item-add $ProjectNumber --owner $Owner --url $issueUrl 2>&1
                Write-Host "  ✓ Issue #$issueNumber created and added to project" -ForegroundColor Green
            } catch {
                Write-Host "  ✓ Issue #$issueNumber created (project add failed)" -ForegroundColor Yellow
            }
            
            Start-Sleep -Milliseconds 500
            return $issueNumber
        }
    } catch {
        Write-Host "  ✗ Failed: $_" -ForegroundColor Red
    }
    
    return $null
}

# ============================================================
# EPIC 1: Synced Query Infrastructure Setup
# ============================================================
Write-Host "`n[EPIC 1] Infrastructure Setup" -ForegroundColor Magenta

$epic1Body = @"
### Epic Summary

Establish the foundational infrastructure required to support Zero Synced Queries, including environment configuration, authentication systems, and base server components.

### User Value Proposition

**As a** Platform Engineer  
**I want** a robust infrastructure for synced queries  
**So that** we can securely deliver filtered data to clients based on user permissions

### Success Metrics

- ✅ Zero-cache successfully routes queries to our API endpoint
- ✅ JWT authentication works correctly for query requests
- ✅ Query context is properly extracted and validated
- ✅ Infrastructure handles 100+ concurrent query requests without degradation

### Dependencies

- Zero Cache 0.23+ running and configured
- NestJS application deployed and accessible
- JWT authentication system operational
- MongoDB with room membership data

### Risk Factors

- **Risk**: Zero-cache compatibility issues with query routing  
  **Mitigation**: Test with exact Zero version, have rollback plan
- **Risk**: Authentication token handling delays  
  **Mitigation**: Implement caching, monitor performance
"@

New-GitHubIssue -Key "E01" -Title "[ZSQ][E01] Synced Query Infrastructure Setup" `
    -Body $epic1Body `
    -Labels @("type/epic", "priority/2-high", "component/backend", "project/zsq")

# E01_01
$story = @"
### User Story

**As a** DevOps Engineer  
**I want** Zero-cache configured to forward query requests to our API  
**So that** clients can use synced queries with server-side filtering

### Acceptance Criteria

- Zero-cache forwards requests to NestJS API endpoint
- Connection verified in zero-cache logs
- Health check endpoints confirm connectivity
- Error handling tested and documented

### Technical Details

- Files: ``apps/source-mongodb-server/.env``, ``apps/zrocket/.env``
- Environment variable: ``ZERO_GET_QUERIES_URL``
- Test with curl or Postman

### Definition of Done

- [ ] Environment variables configured
- [ ] Zero-cache routes successfully
- [ ] Connection verified in logs
- [ ] Documentation updated

**Priority**: High | **Effort**: 1 day
"@

New-GitHubIssue -Key "E01_01" -Title "[ZSQ][E01_01] Configure Zero-Cache Query Endpoint" `
    -Body $story -Labels @("type/feature", "priority/2-high", "component/infrastructure", "project/zsq") `
    -ParentEpic "E01"

# E01_02
$story = @"
### User Story

**As a** Backend Developer  
**I want** TypeScript types for query context  
**So that** I have type safety when working with authenticated user information

### Acceptance Criteria

- TypeScript provides autocomplete for context properties
- Context includes userID, role, and username
- Type guard function verifies authentication status
- Types compile without errors

### Technical Details

- File: ``libs/zrocket-contracts/src/queries/context.ts``
- Export QueryContext type and isAuthenticated function

### Definition of Done

- [ ] TypeScript types defined and exported
- [ ] Type guard implemented
- [ ] Documentation includes examples
- [ ] Code review completed

**Priority**: High | **Effort**: 0.5 days
"@

New-GitHubIssue -Key "E01_02" -Title "[ZSQ][E01_02] Create Query Context Type Definitions" `
    -Body $story -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") `
    -ParentEpic "E01"

# E01_03
$story = @"
### User Story

**As a** Backend Developer  
**I want** a reusable authentication helper for query requests  
**So that** I can consistently extract and validate user identity from JWTs

### Acceptance Criteria

- Valid JWTs return QueryContext with user data
- Invalid/expired tokens throw UnauthorizedException
- Missing tokens return undefined for anonymous access
- Malformed headers throw appropriate errors

### Technical Details

- File: ``apps/zrocket/src/features/zero-queries/auth.helper.ts``
- Class: ``ZeroQueryAuth``
- Method: ``authenticateRequest(request: Request)``

### Definition of Done

- [ ] ZeroQueryAuth class implemented
- [ ] JWT verification working
- [ ] Unit tests passing (100% coverage)
- [ ] Documentation complete

**Priority**: High | **Effort**: 2 days
"@

New-GitHubIssue -Key "E01_03" -Title "[ZSQ][E01_03] Create Authentication Helper for Query Requests" `
    -Body $story -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") `
    -ParentEpic "E01"

# E01_04
$story = @"
### User Story

**As a** Backend Developer  
**I want** a dedicated NestJS module for synced queries  
**So that** query handling is properly organized and maintainable

### Acceptance Criteria

- Module imports successfully into application
- All query services and controllers available
- JWT configuration properly injected
- MongoDB connections available

### Technical Details

- Files: ``zero-queries.module.ts``, ``zero-queries.controller.ts``
- Imports: JwtModule, MongooseModule, ConfigModule
- Providers: GetQueriesHandler, RoomAccessService, ZeroQueryAuth

### Definition of Done

- [ ] Module created with imports
- [ ] Controller registered
- [ ] Application starts successfully
- [ ] Code review completed

**Priority**: High | **Effort**: 1 day
"@

New-GitHubIssue -Key "E01_04" -Title "[ZSQ][E01_04] Create NestJS Module for Zero Queries" `
    -Body $story -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") `
    -ParentEpic "E01"

# ============================================================
# EPIC 2: Query Definitions and Client Integration
# ============================================================
Write-Host "`n[EPIC 2] Query Definitions and Client Integration" -ForegroundColor Magenta

$epic2Body = @"
### Epic Summary

Define all synced queries for channels, rooms, and messages, and integrate them into the React application through updated hooks and components.

### User Value Proposition

**As a** Frontend Developer  
**I want** well-defined synced queries for all data access patterns  
**So that** I can build UI components with proper permission enforcement

### Success Metrics

- ✅ All data access patterns covered by synced queries
- ✅ Existing React hooks migrated successfully
- ✅ No breaking changes to component interfaces
- ✅ Query performance meets < 100ms target

### Dependencies

- Query infrastructure from Epic 1 completed
- React hooks architecture understood
- Zero schema definitions available
"@

New-GitHubIssue -Key "E02" -Title "[ZSQ][E02] Query Definitions and Client Integration" `
    -Body $epic2Body `
    -Labels @("type/epic", "priority/2-high", "component/frontend", "component/backend", "project/zsq")

# E02_01 through E02_08
$stories = @(
    @{
        Key = "E02_01"
        Title = "[ZSQ][E02_01] Define Public Channel Queries"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** synced queries for public channels  
**So that** any user can view public channels

### Acceptance Criteria
- publicChannels query returns all channels ordered by name
- channelById query returns specific channel with messages
- No authentication required
- TypeScript types properly inferred

### Technical Details
- File: ``libs/zrocket-contracts/src/queries/channels.ts``
- Queries: publicChannels(), channelById(channelId)

**Priority**: High | **Effort**: 1 day
"@
        Labels = @("type/feature", "priority/2-high", "component/backend", "project/zsq")
    },
    @{
        Key = "E02_02"
        Title = "[ZSQ][E02_02] Define Private Room Queries (Chats and Groups)"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** synced queries for private rooms  
**So that** authenticated users can access only their own chats and groups

### Acceptance Criteria
- myChats returns only user's accessible chats
- myGroups returns only user's accessible groups
- chatById/groupById filter by membership
- Anonymous users receive empty results

### Technical Details
- File: ``libs/zrocket-contracts/src/queries/rooms.ts``
- Queries: myChats(), myGroups(), chatById(), groupById(), myRooms()

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/feature", "priority/2-high", "component/backend", "project/zsq")
    },
    @{
        Key = "E02_03"
        Title = "[ZSQ][E02_03] Define Message Queries"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** synced queries for messages  
**So that** users can view messages in rooms they have access to

### Acceptance Criteria
- roomMessages filters by room access
- Messages ordered by creation time
- Message limit configurable (default 100)
- System messages have separate query

### Technical Details
- File: ``libs/zrocket-contracts/src/queries/messages.ts``
- Queries: roomMessages(), roomSystemMessages(), searchMessages()

**Priority**: High | **Effort**: 1.5 days
"@
        Labels = @("type/feature", "priority/2-high", "component/backend", "project/zsq")
    },
    @{
        Key = "E02_04"
        Title = "[ZSQ][E02_04] Create Query Index and Exports"
        Body = @"
### User Story
**As a** Developer  
**I want** a centralized export point for all queries  
**So that** I can easily import queries in client and server code

### Acceptance Criteria
- All queries accessible from single import
- Clear, descriptive names
- TypeScript autocomplete works
- No circular dependencies

### Technical Details
- File: ``libs/zrocket-contracts/src/queries/index.ts``
- Export all query modules

**Priority**: Medium | **Effort**: 0.5 days
"@
        Labels = @("type/feature", "priority/3-medium", "component/backend", "project/zsq")
    },
    @{
        Key = "E02_05"
        Title = "[ZSQ][E02_05] Update React Hooks for Channels"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** updated React hooks using synced queries for channels  
**So that** channel components work with new permission system

### Acceptance Criteria
- useChannels/useChannel use synced queries
- Return interface matches previous hooks
- Loading and error states handled
- Existing components work without changes

### Technical Details
- Files: ``use-channels.ts``, ``use-channel.ts``
- Replace direct query usage with synced queries

**Priority**: High | **Effort**: 1 day
"@
        Labels = @("type/feature", "priority/2-high", "component/frontend", "project/zsq")
    },
    @{
        Key = "E02_06"
        Title = "[ZSQ][E02_06] Update React Hooks for Private Rooms"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** updated React hooks using synced queries for chats and groups  
**So that** room components work with proper permission enforcement

### Acceptance Criteria
- useChats/useChat/useGroups/useGroup use synced queries
- Handle authenticated and anonymous states
- Loading and error states handled
- Existing components continue working

### Technical Details
- Files: ``use-chats.ts``, ``use-chat.ts``, ``use-groups.ts``, ``use-group.ts``

**Priority**: High | **Effort**: 1.5 days
"@
        Labels = @("type/feature", "priority/2-high", "component/frontend", "project/zsq")
    },
    @{
        Key = "E02_07"
        Title = "[ZSQ][E02_07] Update React Hooks for Messages"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** updated React hooks using synced queries for messages  
**So that** message components display only accessible messages

### Acceptance Criteria
- useRoomMessages uses synced query
- Works with channel IDs and private room IDs
- Limit parameter optional (default 100)
- Existing message components work

### Technical Details
- File: ``use-room-messages.ts``
- Use roomMessages synced query

**Priority**: High | **Effort**: 1 day
"@
        Labels = @("type/feature", "priority/2-high", "component/frontend", "project/zsq")
    },
    @{
        Key = "E02_08"
        Title = "[ZSQ][E02_08] Update Components Using Direct Queries"
        Body = @"
### User Story
**As a** Frontend Developer  
**I want** all components migrated to use hooks instead of direct queries  
**So that** entire application benefits from synced query permissions

### Acceptance Criteria
- No direct query usage remains in components
- All components use hooks layer
- UI behavior unchanged from user perspective
- All user flows tested end-to-end

### Technical Details
- Audit and update: ``app/routes/**/*.tsx``, ``app/components/**/*.tsx``
- Find pattern: ``zero.query.`` usage

**Priority**: Medium | **Effort**: 2 days
"@
        Labels = @("type/feature", "priority/3-medium", "component/frontend", "project/zsq")
    }
)

foreach ($story in $stories) {
    New-GitHubIssue -Key $story.Key -Title $story.Title -Body $story.Body -Labels $story.Labels -ParentEpic "E02"
}

# ============================================================
# EPIC 3: Server-Side Permission Enforcement
# ============================================================
Write-Host "`n[EPIC 3] Server-Side Permission Enforcement" -ForegroundColor Magenta

$epic3Body = @"
### Epic Summary

Implement the server-side logic that enforces permission filters on synced queries, ensuring users can only access data they're authorized to see.

### User Value Proposition

**As a** User  
**I want** my private conversations to remain private  
**So that** only people I've shared with can see my messages

### Success Metrics

- ✅ Zero unauthorized data access in testing
- ✅ All permission rules correctly enforced
- ✅ Performance impact < 20ms per query
- ✅ Penetration testing passes
"@

New-GitHubIssue -Key "E03" -Title "[ZSQ][E03] Server-Side Permission Enforcement" `
    -Body $epic3Body `
    -Labels @("type/epic", "priority/1-critical", "component/backend", "project/zsq")

$stories = @(
    @{
        Key = "E03_01"
        Title = "[ZSQ][E03_01] Create Room Access Service"
        Body = @"
### User Story
**As a** Backend Developer  
**I want** a service to check room membership  
**So that** I can efficiently determine if a user has access to a room

### Acceptance Criteria
- userHasRoomAccess returns true for public channels
- userHasRoomAccess checks membership for private rooms
- getUserAccessibleRoomIds returns all accessible room IDs
- Database queries are efficient (use indexes)

### Technical Details
- File: ``room-access.service.ts``
- Methods: userHasRoomAccess(), getUserAccessibleRoomIds()

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/feature", "priority/2-high", "component/backend", "project/zsq")
    },
    @{
        Key = "E03_02"
        Title = "[ZSQ][E03_02] Create Permission Filter Logic"
        Body = @"
### User Story
**As a** Backend Developer  
**I want** reusable permission filter functions  
**So that** I can consistently apply security rules to all queries

### Acceptance Criteria
- Filters for all query types implemented
- Authenticated and anonymous user scenarios handled
- Filters compose correctly with base queries
- Performance acceptable (< 20ms overhead)

### Technical Details
- File: ``permission-filters.ts``
- Class: PermissionFilters with static methods for each query type

**Priority**: High | **Effort**: 3 days
"@
        Labels = @("type/feature", "priority/1-critical", "component/backend", "project/zsq")
    },
    @{
        Key = "E03_03"
        Title = "[ZSQ][E03_03] Create Get Queries Handler"
        Body = @"
### User Story
**As a** Backend Developer  
**I want** a handler that processes get-queries requests  
**So that** Zero-cache receives properly filtered queries

### Acceptance Criteria
- Authenticates user from JWT
- Executes requested query function
- Applies appropriate permission filters
- Returns filtered query AST
- Handles errors gracefully

### Technical Details
- File: ``get-queries.handler.ts``
- Class: GetQueriesHandler (Injectable)
- Method: handleRequest(request: Request)

**Priority**: High | **Effort**: 3 days
"@
        Labels = @("type/feature", "priority/1-critical", "component/backend", "project/zsq")
    },
    @{
        Key = "E03_04"
        Title = "[ZSQ][E03_04] Create API Controller Endpoint"
        Body = @"
### User Story
**As a** Zero-cache Instance  
**I want** an HTTP endpoint to send query requests to  
**So that** I can get filtered queries for client requests

### Acceptance Criteria
- POST /api/zero/get-queries endpoint accessible
- Delegates to GetQueriesHandler
- Returns filtered queries in response
- Uses appropriate HTTP status codes

### Technical Details
- File: ``zero-queries.controller.ts``
- Controller: @Controller('api/zero')
- Endpoint: @Post('get-queries')

**Priority**: High | **Effort**: 1 day
"@
        Labels = @("type/feature", "priority/2-high", "component/backend", "project/zsq")
    },
    @{
        Key = "E03_05"
        Title = "[ZSQ][E03_05] Integrate Module into Application"
        Body = @"
### User Story
**As a** Backend Developer  
**I want** the zero-queries module integrated into main application  
**So that** the API endpoint is available when app runs

### Acceptance Criteria
- /api/zero/get-queries listed in registered routes
- All dependencies resolve correctly
- No startup errors occur
- Health check confirms endpoint working

### Technical Details
- File: ``app.module.ts``
- Import ZeroQueriesModule

**Priority**: High | **Effort**: 0.5 days
"@
        Labels = @("type/feature", "priority/2-high", "component/backend", "project/zsq")
    }
)

foreach ($story in $stories) {
    New-GitHubIssue -Key $story.Key -Title $story.Title -Body $story.Body -Labels $story.Labels -ParentEpic "E03"
}

# ============================================================
# EPIC 4: Testing and Quality Assurance
# ============================================================
Write-Host "`n[EPIC 4] Testing and Quality Assurance" -ForegroundColor Magenta

$epic4Body = @"
### Epic Summary

Comprehensive testing of synced queries implementation including unit tests, integration tests, security testing, and performance validation.

### User Value Proposition

**As a** Product Owner  
**I want** thorough testing of permission enforcement  
**So that** we can confidently deploy without security vulnerabilities

### Success Metrics

- ✅ 90%+ code coverage on permission logic
- ✅ Zero security vulnerabilities in penetration testing
- ✅ All performance benchmarks met
- ✅ 100% of acceptance criteria verified
"@

New-GitHubIssue -Key "E04" -Title "[ZSQ][E04] Testing and Quality Assurance" `
    -Body $epic4Body `
    -Labels @("type/epic", "priority/1-critical", "component/testing", "project/zsq")

$stories = @(
    @{
        Key = "E04_01"
        Title = "[ZSQ][E04_01] Write Unit Tests for Query Definitions"
        Body = @"
### User Story
**As a** QA Engineer  
**I want** comprehensive unit tests for all query definitions  
**So that** query logic is verified and regressions prevented

### Acceptance Criteria
- TypeScript types compile correctly
- Zod validation accepts valid inputs
- Zod validation rejects invalid inputs
- Query context properly typed and used
- 95%+ code coverage

### Technical Details
- Files: ``__tests__/channels.spec.ts``, ``rooms.spec.ts``, ``messages.spec.ts``, ``context.spec.ts``

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/testing", "priority/2-high", "component/testing", "project/zsq")
    },
    @{
        Key = "E04_02"
        Title = "[ZSQ][E04_02] Write Unit Tests for Permission Filters"
        Body = @"
### User Story
**As a** QA Engineer  
**I want** comprehensive unit tests for permission filter logic  
**So that** security rules are verified to work correctly

### Acceptance Criteria
- Authenticated user filtering works
- Anonymous user filtering returns empty results
- Edge cases handled (null IDs, empty arrays)
- Malicious inputs rejected safely
- Performance acceptable (< 20ms per filter)
- 100% code coverage on filters

### Technical Details
- File: ``__tests__/permission-filters.spec.ts``

**Priority**: High | **Effort**: 3 days
"@
        Labels = @("type/testing", "priority/1-critical", "component/testing", "project/zsq")
    },
    @{
        Key = "E04_03"
        Title = "[ZSQ][E04_03] Write Integration Tests for Handler"
        Body = @"
### User Story
**As a** QA Engineer  
**I want** integration tests for get-queries handler  
**So that** end-to-end query flow is verified

### Acceptance Criteria
- Authenticated requests work correctly
- Anonymous requests work correctly
- Invalid/expired tokens rejected
- Malformed requests return proper errors
- Multiple queries handled correctly

### Technical Details
- File: ``__tests__/get-queries.integration.spec.ts``

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/testing", "priority/2-high", "component/testing", "project/zsq")
    },
    @{
        Key = "E04_04"
        Title = "[ZSQ][E04_04] Write E2E Tests for Client-Server Flow"
        Body = @"
### User Story
**As a** QA Engineer  
**I want** end-to-end tests covering complete flow  
**So that** entire synced queries system is verified working

### Acceptance Criteria
- Public channels accessible to all
- Private chats/groups only accessible to members
- Messages filtered by room access
- Real-time updates work correctly
- Authentication flow works end-to-end

### Technical Details
- File: ``test/e2e/synced-queries.e2e.spec.ts``
- Framework: Playwright

**Priority**: High | **Effort**: 3 days
"@
        Labels = @("type/testing", "priority/2-high", "component/testing", "project/zsq")
    },
    @{
        Key = "E04_05"
        Title = "[ZSQ][E04_05] Security Testing and Penetration Testing"
        Body = @"
### User Story
**As a** Security Engineer  
**I want** thorough security testing of permission enforcement  
**So that** we can identify and fix vulnerabilities before deployment

### Acceptance Criteria
- Users cannot access other users' chats
- Users cannot bypass JWT authentication
- Malicious JWT tokens rejected
- SQL/NoSQL injection prevented
- Rate limiting works correctly
- No sensitive data leaks in errors

### Technical Details
- File: ``test/security/permission-bypass.spec.ts``
- Tools: OWASP ZAP, Burp Suite, custom scripts

**Priority**: Critical | **Effort**: 3 days
"@
        Labels = @("type/testing", "priority/1-critical", "component/testing", "project/zsq")
    },
    @{
        Key = "E04_06"
        Title = "[ZSQ][E04_06] Performance Testing and Optimization"
        Body = @"
### User Story
**As a** Performance Engineer  
**I want** comprehensive performance testing of synced queries  
**So that** we ensure acceptable response times under load

### Acceptance Criteria
- Query response times < 100ms (p95)
- Permission filter overhead < 20ms
- Authentication adds < 10ms overhead
- System handles 100+ concurrent users
- Database queries use indexes efficiently
- No memory leaks detected

### Technical Details
- File: ``test/performance/query-performance.spec.ts``
- Tools: Artillery, k6

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/testing", "priority/2-high", "component/testing", "project/zsq")
    }
)

foreach ($story in $stories) {
    New-GitHubIssue -Key $story.Key -Title $story.Title -Body $story.Body -Labels $story.Labels -ParentEpic "E04"
}

# ============================================================
# EPIC 5: Deployment and Monitoring
# ============================================================
Write-Host "`n[EPIC 5] Deployment and Monitoring" -ForegroundColor Magenta

$epic5Body = @"
### Epic Summary

Deploy the synced queries implementation to production with proper monitoring, rollback capabilities, and gradual rollout strategy.

### User Value Proposition

**As a** Product Owner  
**I want** safe, monitored deployment of synced queries  
**So that** we can deliver value to users while minimizing risk

### Success Metrics

- ✅ Zero-downtime deployment achieved
- ✅ 99.9% uptime during rollout
- ✅ Rollback capability tested and working
- ✅ All monitoring alerts functioning
"@

New-GitHubIssue -Key "E05" -Title "[ZSQ][E05] Deployment and Monitoring" `
    -Body $epic5Body `
    -Labels @("type/epic", "priority/2-high", "component/infrastructure", "project/zsq")

$stories = @(
    @{
        Key = "E05_01"
        Title = "[ZSQ][E05_01] Configure Production Environment"
        Body = @"
### User Story
**As a** DevOps Engineer  
**I want** production environment configured for synced queries  
**So that** system can operate securely and reliably

### Acceptance Criteria
- ZERO_GET_QUERIES_URL points to production API
- JWT secrets securely managed
- MongoDB uses production credentials
- HTTPS enforced
- CORS properly configured
- Rate limiting enabled

**Priority**: High | **Effort**: 1 day
"@
        Labels = @("type/feature", "priority/2-high", "component/infrastructure", "project/zsq")
    },
    @{
        Key = "E05_02"
        Title = "[ZSQ][E05_02] Implement Logging and Monitoring"
        Body = @"
### User Story
**As a** DevOps Engineer  
**I want** comprehensive logging and monitoring for synced queries  
**So that** I can detect and respond to issues quickly

### Acceptance Criteria
- Dashboards show query response times, error rates, throughput
- Logs include query names, user IDs, execution times
- Alerts trigger for high error rates
- Alerts trigger for slow queries (> 200ms)
- Authentication failures logged
- Suspicious activity triggers alerts

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/feature", "priority/2-high", "component/infrastructure", "project/zsq")
    },
    @{
        Key = "E05_03"
        Title = "[ZSQ][E05_03] Implement Feature Flag System"
        Body = @"
### User Story
**As a** Product Manager  
**I want** feature flags for synced queries  
**So that** we can enable/disable feature without code deployment

### Acceptance Criteria
- Feature flag system integrated
- Flags configurable via dashboard
- Percentage rollout works
- User allowlist works
- Fallback behavior correct
- Flag changes apply quickly

**Priority**: High | **Effort**: 1.5 days
"@
        Labels = @("type/feature", "priority/2-high", "component/infrastructure", "project/zsq")
    },
    @{
        Key = "E05_04"
        Title = "[ZSQ][E05_04] Create Deployment Pipeline"
        Body = @"
### User Story
**As a** DevOps Engineer  
**I want** automated deployment pipeline for synced queries  
**So that** deployments are consistent, tested, and reliable

### Acceptance Criteria
- Pipeline runs all tests on merge to main
- Builds Docker images
- Deploys to staging automatically
- Runs smoke tests in staging
- Requires manual approval for production
- Deploys to production with zero downtime

**Priority**: High | **Effort**: 2 days
"@
        Labels = @("type/feature", "priority/2-high", "component/infrastructure", "project/zsq")
    },
    @{
        Key = "E05_05"
        Title = "[ZSQ][E05_05] Execute Gradual Rollout Plan"
        Body = @"
### User Story
**As a** Product Manager  
**I want** to gradually roll out synced queries to users  
**So that** we can monitor impact and catch issues early

### Acceptance Criteria
- Day 1: Internal team (10 users)
- Day 2: Beta users (50 users)
- Day 3: 10% of all users
- Day 4: 50% of all users
- Day 5: 100% of all users
- Monitor for errors, performance, user feedback at each stage
- Rollback capability ready

**Priority**: Critical | **Effort**: 5 days (spread over 1 week)
"@
        Labels = @("type/feature", "priority/1-critical", "component/infrastructure", "project/zsq")
    },
    @{
        Key = "E05_06"
        Title = "[ZSQ][E05_06] Create Operational Runbooks"
        Body = @"
### User Story
**As an** On-Call Engineer  
**I want** operational runbooks for synced queries  
**So that** I can quickly respond to incidents and issues

### Acceptance Criteria
- Runbooks provide clear diagnostic and resolution steps
- Cover common scenarios: slow queries, high errors, auth failures, permission issues
- Include deployment, rollback, troubleshooting, monitoring, incident response runbooks
- Accessible to operations team

**Priority**: Medium | **Effort**: 2 days
"@
        Labels = @("type/documentation", "priority/3-medium", "component/infrastructure", "project/zsq")
    }
)

foreach ($story in $stories) {
    New-GitHubIssue -Key $story.Key -Title $story.Title -Body $story.Body -Labels $story.Labels -ParentEpic "E05"
}

# ============================================================
# Summary
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Issue Creation Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Created Issues:" -ForegroundColor Yellow
Write-Host "  - 5 Epics" -ForegroundColor White
Write-Host "  - $($issues.Count - 5) User Stories`n" -ForegroundColor White

Write-Host "Epic Issue Numbers:" -ForegroundColor Yellow
Write-Host "  [E01] Infrastructure Setup: #$($issues['E01'])" -ForegroundColor White
Write-Host "  [E02] Query Definitions: #$($issues['E02'])" -ForegroundColor White
Write-Host "  [E03] Permission Enforcement: #$($issues['E03'])" -ForegroundColor White
Write-Host "  [E04] Testing & QA: #$($issues['E04'])" -ForegroundColor White
Write-Host "  [E05] Deployment: #$($issues['E05'])`n" -ForegroundColor White

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Visit https://github.com/users/$Owner/projects/$ProjectNumber" -ForegroundColor White
Write-Host "2. Organize issues into columns on the project board" -ForegroundColor White
Write-Host "3. Assign team members to issues" -ForegroundColor White
Write-Host "4. Set milestone dates" -ForegroundColor White
Write-Host "5. Begin implementation!`n" -ForegroundColor White

Write-Host "Project URL: https://github.com/users/$Owner/projects/$ProjectNumber" -ForegroundColor Green
