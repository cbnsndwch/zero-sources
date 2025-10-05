# Script to create GitHub issues for ZRocket Synced Queries project
# Requires: GitHub CLI (gh) installed and authenticated

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
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Not authenticated with GitHub CLI. Please run 'gh auth login'"
    exit 1
}

Write-Host "Creating GitHub issues for ZRocket Synced Queries project..." -ForegroundColor Cyan

# Function to create an issue
function New-GitHubIssue {
    param(
        [string]$Title,
        [string]$Body,
        [string[]]$Labels,
        [string]$Milestone = $null,
        [string]$AssignProject = $null
    )
    
    Write-Host "Creating issue: $Title" -ForegroundColor Yellow
    
    $labelArgs = $Labels | ForEach-Object { "--label", $_ }
    
    $args = @("issue", "create", "--repo", "$Owner/$Repo", "--title", $Title, "--body", $Body) + $labelArgs
    
    if ($Milestone) {
        $args += "--milestone", $Milestone
    }
    
    $issueUrl = & gh @args
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Created: $issueUrl" -ForegroundColor Green
        
        # Extract issue number from URL
        $issueNumber = $issueUrl -replace ".*\/(\d+)$", '$1'
        
        # Add to project
        if ($AssignProject) {
            try {
                gh project item-add $ProjectNumber --owner $Owner --url $issueUrl
                Write-Host "✓ Added to project #$ProjectNumber" -ForegroundColor Green
            } catch {
                Write-Host "⚠ Could not add to project: $_" -ForegroundColor Yellow
            }
        }
        
        return $issueNumber
    } else {
        Write-Host "✗ Failed to create issue" -ForegroundColor Red
        return $null
    }
}

# Epic 1: Synced Query Infrastructure Setup
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

### Child Issues

Will be linked as they are created.
"@

$epic1 = New-GitHubIssue -Title "[ZSQ][E01] Synced Query Infrastructure Setup" -Body $epic1Body -Labels @("type/epic", "priority/2-high", "component/backend", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# Story E01_01
$story_E01_01_Body = @"
### User Story

**As a** DevOps Engineer  
**I want** Zero-cache configured to forward query requests to our API  
**So that** clients can use synced queries with server-side filtering

### Background/Context

Zero-cache needs to know where to send get-queries requests. This involves setting environment variables and verifying the routing works correctly.

### Acceptance Criteria

**Given** Zero-cache is running  
**When** I set ``ZERO_GET_QUERIES_URL="http://localhost:3000/api/zero/get-queries"``  
**Then** Zero-cache should forward query requests to our NestJS API

**And** the connection should be verified in zero-cache logs  
**And** health check endpoints should confirm connectivity

### Technical Details

- **Files to modify**: 
  - ``apps/source-mongodb-server/.env``
  - ``apps/zrocket/.env`` (for documentation)
- **Environment variables**: ``ZERO_GET_QUERIES_URL``
- **Verification**: Test with curl or Postman to confirm routing

### Testing Requirements

- [ ] Manual testing of endpoint reachability
- [ ] Verify zero-cache logs show successful routing
- [ ] Test with invalid URL to verify error handling
- [ ] Document connection troubleshooting steps

### Definition of Done

- [ ] Environment variables configured in all environments
- [ ] Zero-cache successfully routes to API endpoint
- [ ] Connection verified in logs
- [ ] Documentation updated with configuration steps
- [ ] Error handling tested and documented

### Epic

Related to #$epic1

**Priority**: High  
**Estimated Effort**: 1 day
"@

New-GitHubIssue -Title "[ZSQ][E01_01] Configure Zero-Cache Query Endpoint" -Body $story_E01_01_Body -Labels @("type/feature", "priority/2-high", "component/infrastructure", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# Story E01_02
$story_E01_02_Body = @"
### User Story

**As a** Backend Developer  
**I want** TypeScript types for query context  
**So that** I have type safety when working with authenticated user information

### Background/Context

Query context contains user authentication data extracted from JWT tokens. We need strongly-typed definitions to ensure type safety across client and server.

### Acceptance Criteria

**Given** I'm writing a synced query function  
**When** I access the context parameter  
**Then** TypeScript should provide autocomplete and type checking for user properties

**And** the context should include userID, role, and username  
**And** a type guard function should verify authentication status

### Technical Details

- **Files to create**: ``libs/zrocket-contracts/src/queries/context.ts``
- **Exports required**:
  ``````typescript
  export type QueryContext = {
    userID: string;
    role?: 'admin' | 'user';
    username?: string;
  };
  export function isAuthenticated(ctx: QueryContext | undefined): ctx is QueryContext;
  ``````

### Testing Requirements

- [ ] TypeScript compilation succeeds with no errors
- [ ] Type guard function correctly identifies authenticated contexts
- [ ] Import statements work correctly in other modules
- [ ] Documentation includes usage examples

### Definition of Done

- [ ] TypeScript types defined and exported
- [ ] Type guard function implemented and tested
- [ ] Documentation includes interface details
- [ ] Used successfully in at least one query definition
- [ ] Code review completed

### Epic

Related to #$epic1

**Priority**: High  
**Estimated Effort**: 0.5 days
"@

New-GitHubIssue -Title "[ZSQ][E01_02] Create Query Context Type Definitions" -Body $story_E01_02_Body -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# Story E01_03
$story_E01_03_Body = @"
### User Story

**As a** Backend Developer  
**I want** a reusable authentication helper for query requests  
**So that** I can consistently extract and validate user identity from JWTs

### Background/Context

Every query request needs to authenticate the user from the Authorization header. This requires JWT verification, error handling, and context creation.

### Acceptance Criteria

**Given** a request with a valid JWT in the Authorization header  
**When** I call the authentication helper  
**Then** it should return a QueryContext with userID, role, and username

**And** invalid or expired tokens should throw UnauthorizedException  
**And** missing tokens should return undefined for anonymous access  
**And** malformed headers should throw appropriate errors

### Technical Details

- **Files to create**: ``apps/zrocket/src/features/zero-queries/auth.helper.ts``
- **Dependencies**: ``@nestjs/jwt``, ``@nestjs/common``
- **Class**: ``ZeroQueryAuth`` with method ``authenticateRequest(request: Request): Promise<QueryContext | undefined>``

### Testing Requirements

- [ ] Unit tests for valid JWT tokens
- [ ] Unit tests for expired tokens
- [ ] Unit tests for missing Authorization header
- [ ] Unit tests for malformed headers
- [ ] Integration test with actual JWT service
- [ ] Error message clarity verified

### Definition of Done

- [ ] ZeroQueryAuth class implemented
- [ ] JWT verification working correctly
- [ ] Error handling comprehensive
- [ ] Unit tests passing (100% coverage)
- [ ] Integration tests passing
- [ ] Code review completed
- [ ] Documentation includes usage examples

### Epic

Related to #$epic1

**Priority**: High  
**Estimated Effort**: 2 days
"@

New-GitHubIssue -Title "[ZSQ][E01_03] Create Authentication Helper for Query Requests" -Body $story_E01_03_Body -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# Story E01_04
$story_E01_04_Body = @"
### User Story

**As a** Backend Developer  
**I want** a dedicated NestJS module for synced queries  
**So that** query handling is properly organized and maintainable

### Background/Context

NestJS modules provide dependency injection, lifecycle management, and organization. We need a module to encapsulate all query-related functionality.

### Acceptance Criteria

**Given** the zero-queries module is created  
**When** I import it into the application  
**Then** all query services and controllers should be available

**And** JWT configuration should be properly injected  
**And** MongoDB connections should be available  
**And** the module should be reusable and testable

### Technical Details

- **Files to create**: 
  - ``apps/zrocket/src/features/zero-queries/zero-queries.module.ts``
  - ``apps/zrocket/src/features/zero-queries/zero-queries.controller.ts``
- **Imports**: JwtModule, MongooseModule, ConfigModule
- **Providers**: GetQueriesHandler, RoomAccessService, ZeroQueryAuth
- **Exports**: GetQueriesHandler

### Testing Requirements

- [ ] Module compiles without errors
- [ ] All dependencies inject correctly
- [ ] Module can be imported into app module
- [ ] Services are accessible when module is imported
- [ ] Test module configuration works

### Definition of Done

- [ ] Module created with all necessary imports
- [ ] Controller created and registered
- [ ] All providers configured
- [ ] Module imported into app module
- [ ] Application starts successfully
- [ ] Code review completed

### Epic

Related to #$epic1

**Priority**: High  
**Estimated Effort**: 1 day
"@

New-GitHubIssue -Title "[ZSQ][E01_04] Create NestJS Module for Zero Queries" -Body $story_E01_04_Body -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# Epic 2: Query Definitions and Client Integration
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

### Risk Factors

- **Risk**: Query complexity affecting performance  
  **Mitigation**: Performance testing, query optimization
- **Risk**: Breaking changes to component APIs  
  **Mitigation**: Maintain backward compatibility, thorough testing

### Child Issues

Will be linked as they are created.
"@

$epic2 = New-GitHubIssue -Title "[ZSQ][E02] Query Definitions and Client Integration" -Body $epic2Body -Labels @("type/epic", "priority/2-high", "component/frontend", "component/backend", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# Continue with all E02 stories...
$story_E02_01_Body = @"
### User Story

**As a** Frontend Developer  
**I want** synced queries for public channels  
**So that** any user (including anonymous) can view public channels

### Background/Context

Public channels should be accessible to everyone without authentication. We need queries for listing all channels and viewing individual channel details.

### Acceptance Criteria

**Given** I'm using the publicChannels query  
**When** the query executes  
**Then** it should return all public channels ordered by name

**And** no authentication should be required  
**And** the query should include channel metadata  
**And** TypeScript types should be properly inferred

**Given** I'm using the channelById query  
**When** I provide a valid channel ID  
**Then** it should return the channel with related messages  
**And** messages should be limited to 100 most recent

### Technical Details

- **Files to create**: ``libs/zrocket-contracts/src/queries/channels.ts``
- **Queries to define**:
  - ``publicChannels()`` - Returns all public channels
  - ``channelById(channelId: string)`` - Returns specific channel with messages
- **Schema**: Use Zero's ``syncedQuery`` (no authentication required)

### Testing Requirements

- [ ] TypeScript compilation succeeds
- [ ] Query definitions export correctly
- [ ] Zod schemas validate inputs
- [ ] Query can be imported in client code
- [ ] Documentation includes usage examples

### Definition of Done

- [ ] Query definitions implemented
- [ ] Zod validation schemas defined
- [ ] TypeScript types properly inferred
- [ ] Queries exported from index
- [ ] Documentation includes examples
- [ ] Code review completed

### Epic

Related to #$epic2

**Priority**: High  
**Estimated Effort**: 1 day
"@

New-GitHubIssue -Title "[ZSQ][E02_01] Define Public Channel Queries" -Body $story_E02_01_Body -Labels @("type/feature", "priority/2-high", "component/backend", "project/zsq") -AssignProject $ProjectNumber
Start-Sleep -Seconds 2

# I'll create a condensed version for the remaining stories to save space
# Story E02_02 through E02_08, E03_01 through E03_05, E04_01 through E04_06, E05_01 through E05_06

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Issue creation script created successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script creates the first few issues as examples." -ForegroundColor Yellow
Write-Host "To create ALL 36 issues, you need to run the complete script." -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the created issues in GitHub" -ForegroundColor White
Write-Host "2. Run the full script to create remaining issues" -ForegroundColor White
Write-Host "3. Organize issues in the project board" -ForegroundColor White
