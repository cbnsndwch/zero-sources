# Script to create the master ZSQ project issue
# This will be the PRD-level issue that links to all epics

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
Write-Host "Create ZSQ Master Project Issue" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get the epic issue numbers
Write-Host "Fetching epic issue numbers..." -ForegroundColor Yellow

$epic1 = (gh issue list --repo "$Owner/$Repo" --search "[ZSQ][E01]" --json number --limit 1 | ConvertFrom-Json)[0].number
$epic2 = (gh issue list --repo "$Owner/$Repo" --search "[ZSQ][E02]" --json number --limit 1 | ConvertFrom-Json)[0].number
$epic3 = (gh issue list --repo "$Owner/$Repo" --search "[ZSQ][E03]" --json number --limit 1 | ConvertFrom-Json)[0].number
$epic4 = (gh issue list --repo "$Owner/$Repo" --search "[ZSQ][E04]" --json number --limit 1 | ConvertFrom-Json)[0].number
$epic5 = (gh issue list --repo "$Owner/$Repo" --search "[ZSQ][E05]" --json number --limit 1 | ConvertFrom-Json)[0].number

Write-Host "Found epics: #$epic1, #$epic2, #$epic3, #$epic4, #$epic5`n" -ForegroundColor Green

# Create the issue body
$issueBody = @"
# ZRocket Synced Queries Implementation

## 📋 Project Overview

**Project Code**: ZSQ  
**Version**: 1.0  
**Status**: Planning  
**Owner**: Engineering Team

This project implements Zero's Synced Queries feature to enable proper permission enforcement for the ZRocket messaging application. Currently, ZRocket cannot enforce member-only access to private rooms and DMs because Zero's standard permissions system doesn't support checking membership in JSON array columns. Synced Queries solve this by allowing server-side query filtering that clients cannot bypass.

## 🎯 Problem Statement

### Current Security Issues

- **Security Vulnerability**: Any logged-in user can see ALL direct messages and private groups, not just their own
- **No Message Filtering**: All users can see messages in ALL rooms, regardless of membership
- **Technical Limitation**: Zero's standard permissions don't support checking if a value exists in a JSON array column (``memberIds``)

### Business Impact

- 🔴 **Security Risk**: Private conversations and group discussions are exposed to unauthorized users
- 🔴 **Privacy Violation**: Users can access data they shouldn't see
- 🔴 **Compliance**: May violate privacy regulations (GDPR, etc.)
- 🔴 **Trust**: Cannot deploy to production without proper access controls

## 🎯 Goals & Success Criteria

### Primary Goals

1. ✅ Implement secure, member-only access to private rooms and DMs
2. ✅ Ensure messages are only visible to users with access to the containing room
3. ✅ Maintain Zero's real-time, instant UI experience
4. ✅ No breaking changes to existing data structure

### Success Criteria

- ✅ Non-logged-in users can only see public channels
- ✅ Logged-in users can only see rooms they are members of
- ✅ Messages are filtered based on room access
- ✅ Performance remains acceptable (queries < 100ms)
- ✅ No client-side permission bypasses possible

## 💡 Solution: Zero Synced Queries

**Synced Queries** allow us to define queries on both client and server, where the server implementation adds permission filters that clients cannot bypass. This is Zero's recommended approach for complex permission scenarios.

### How It Works

1. **Client**: Defines optimistic queries for instant UI
2. **Server**: Receives query requests, adds permission filters, returns filtered results
3. **Zero Cache**: Manages synchronization and real-time updates
4. **Result**: Secure, performant, real-time data access

### Key Advantage

The server can use **any filtering logic**, including checking JSON array membership, custom business logic, or complex joins that aren't expressible in standard Zero permissions.

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │ Defines queries optimistically
│  (React)    │ 
└──────┬──────┘
       │ Query request with args
       ▼
┌─────────────┐
│ Zero Cache  │ Forwards to get-queries endpoint
│             │
└──────┬──────┘
       │ HTTP POST /api/zero/get-queries
       ▼
┌─────────────┐
│   Server    │ 1. Authenticates user
│  (NestJS)   │ 2. Applies permission filters
│             │ 3. Returns filtered query
└──────┬──────┘
       │ Filtered query AST
       ▼
┌─────────────┐
│ Zero Cache  │ Executes query, syncs results
│             │
└──────┬──────┘
       │ Real-time updates
       ▼
┌─────────────┐
│   Client    │ Receives filtered data
│             │
└─────────────┘
```

## 📦 Implementation Epics

This project is organized into 5 major epics with 36 user stories:

### #$epic1 [E01] Synced Query Infrastructure Setup
**Effort**: ~5 days | **Priority**: High

Establish the foundational infrastructure required to support Zero Synced Queries, including environment configuration, authentication systems, and base server components.

**Key Deliverables**:
- Zero-cache query endpoint configuration
- Query context type definitions
- JWT authentication helper
- NestJS module for zero queries

**Success Metrics**:
- ✅ Zero-cache successfully routes queries to API endpoint
- ✅ JWT authentication works correctly for query requests
- ✅ Query context properly extracted and validated
- ✅ Infrastructure handles 100+ concurrent query requests

---

### #$epic2 [E02] Query Definitions and Client Integration
**Effort**: ~9.5 days | **Priority**: High

Define all synced queries for channels, rooms, and messages, and integrate them into the React application through updated hooks and components.

**Key Deliverables**:
- Public channel queries (no auth required)
- Private room queries (chats and groups)
- Message queries with permission filtering
- Updated React hooks for all data access
- Component migration to use synced queries

**Success Metrics**:
- ✅ All data access patterns covered by synced queries
- ✅ Existing React hooks migrated successfully
- ✅ No breaking changes to component interfaces
- ✅ Query performance meets < 100ms target

---

### #$epic3 [E03] Server-Side Permission Enforcement
**Effort**: ~9.5 days | **Priority**: Critical

Implement the server-side logic that enforces permission filters on synced queries, ensuring users can only access data they're authorized to see.

**Key Deliverables**:
- Room access service for membership verification
- Permission filter logic for all query types
- Get-queries handler for processing requests
- API controller endpoint
- Integration into main application

**Success Metrics**:
- ✅ Zero unauthorized data access in testing
- ✅ All permission rules correctly enforced
- ✅ Performance impact < 20ms per query
- ✅ Penetration testing passes

---

### #$epic4 [E04] Testing and Quality Assurance
**Effort**: ~15 days | **Priority**: Critical

Comprehensive testing of synced queries implementation including unit tests, integration tests, security testing, and performance validation.

**Key Deliverables**:
- Unit tests for query definitions
- Unit tests for permission filters (100% coverage)
- Integration tests for handler
- End-to-end tests for client-server flow
- Security and penetration testing
- Performance testing and optimization

**Success Metrics**:
- ✅ 90%+ code coverage on permission logic
- ✅ Zero security vulnerabilities found
- ✅ All performance benchmarks met
- ✅ 100% of acceptance criteria verified

---

### #$epic5 [E05] Deployment and Monitoring
**Effort**: ~13.5 days | **Priority**: High

Deploy the synced queries implementation to production with proper monitoring, rollback capabilities, and gradual rollout strategy.

**Key Deliverables**:
- Production environment configuration
- Logging and monitoring dashboards
- Feature flag system for gradual rollout
- Automated deployment pipeline
- Gradual rollout execution (5-day plan)
- Operational runbooks

**Success Metrics**:
- ✅ Zero-downtime deployment achieved
- ✅ 99.9% uptime during rollout
- ✅ Rollback capability tested and working
- ✅ All monitoring alerts functioning

---

## 📊 Project Summary

**Total Effort**: ~52.5 days (~10.5 weeks for single developer, ~5-6 weeks for team of 2-3)

**Story Breakdown**:
- 5 Epic issues
- 36 User Story issues
- Total: 41 GitHub issues

**Priority Distribution**:
- Critical: 3 epics (E03, E04, E05_05)
- High: 28 stories
- Medium: 5 stories

## 📚 Documentation

- **PRD**: ``docs/projects/zrocket-synced-queries/PRD.md``
- **Epics & Stories**: ``docs/projects/zrocket-synced-queries/EPICS_AND_STORIES.md``
- **Project Scripts**: ``docs/projects/zrocket-synced-queries/__scripts/``

## 🔗 Related Issues

All epic and story issues are tracked in [Project #4](https://github.com/users/$Owner/projects/$ProjectNumber).

## ⚠️ Risk Factors

### Technical Risks
- **Zero-cache compatibility**: Test with exact Zero version, have rollback plan
- **Authentication token handling**: Implement caching, monitor performance  
- **Query complexity**: Performance testing, query optimization
- **Breaking changes**: Maintain backward compatibility, thorough testing

### Mitigation Strategies
- Comprehensive testing at all levels (unit, integration, E2E, security)
- Gradual rollout with monitoring at each stage
- Feature flags for quick disable if issues arise
- Performance benchmarking and optimization
- Detailed operational runbooks for incident response

## 🚀 Getting Started

1. Review all epic issues and user stories
2. Ensure all prerequisites are in place (Zero Cache 0.23+, NestJS, MongoDB)
3. Begin with [E01] Infrastructure Setup
4. Follow epic sequence for optimal implementation order
5. Maintain close communication with QA for testing coordination

---

**Last Updated**: October 5, 2025  
**Project Board**: https://github.com/users/$Owner/projects/$ProjectNumber
"@

$issueTitle = "[ZSQ] ZRocket Synced Queries - Project Implementation"

Write-Host "Creating master project issue..." -ForegroundColor Yellow

try {
    $issueUrl = gh issue create --repo "$Owner/$Repo" `
        --title $issueTitle `
        --body $issueBody `
        --label "type:epic" `
        --label "priority:critical" `
        2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $issueNumber = $issueUrl -replace ".*\/(\d+)$", '$1'
        Write-Host "✓ Created issue #$issueNumber" -ForegroundColor Green
        Write-Host "  URL: $issueUrl" -ForegroundColor Cyan
        
        # Add to project
        Write-Host "`nAdding to project..." -ForegroundColor Yellow
        try {
            $null = gh project item-add $ProjectNumber --owner $Owner --url $issueUrl 2>&1
            Write-Host "✓ Added to project #$ProjectNumber" -ForegroundColor Green
        } catch {
            Write-Host "⚠ Could not add to project: $_" -ForegroundColor Yellow
        }
        
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "Success!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        Write-Host "Master Issue: #$issueNumber" -ForegroundColor White
        Write-Host "Linked Epics:" -ForegroundColor White
        Write-Host "  - #$epic1 [E01] Infrastructure Setup" -ForegroundColor White
        Write-Host "  - #$epic2 [E02] Query Definitions" -ForegroundColor White
        Write-Host "  - #$epic3 [E03] Permission Enforcement" -ForegroundColor White
        Write-Host "  - #$epic4 [E04] Testing & QA" -ForegroundColor White
        Write-Host "  - #$epic5 [E05] Deployment" -ForegroundColor White
        
        Write-Host "`nNext Steps:" -ForegroundColor Cyan
        Write-Host "1. Pin this issue to the repository for visibility" -ForegroundColor White
        Write-Host "2. Update epic issues to reference the master issue" -ForegroundColor White
        Write-Host "3. Begin implementation with Epic 1" -ForegroundColor White
        
        Write-Host "`nProject Board: https://github.com/users/$Owner/projects/$ProjectNumber" -ForegroundColor Green
        Write-Host "Issue URL: $issueUrl`n" -ForegroundColor Green
        
    } else {
        Write-Host "✗ Failed to create issue: $issueUrl" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    exit 1
}
