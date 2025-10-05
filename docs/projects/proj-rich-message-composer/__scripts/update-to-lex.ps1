# Script to update Rich Message Composer issues from [RMC] to [LEX] prefix

Write-Host "Updating Rich Message Composer issues to use [LEX] prefix..." -ForegroundColor Green

# Project tracking issue
Write-Host "Updating #20 - Project tracking issue..." -ForegroundColor Cyan
gh issue edit 20 --title "[LEX][PROJECT] Rich Message Composer - Lexical Integration"

# Epic issues
Write-Host "Updating Epics..." -ForegroundColor Cyan
gh issue edit 10 --title "[LEX][E01] Rich Text Features Implementation"
gh issue edit 11 --title "[LEX][E02] Advanced Features & User Experience"
gh issue edit 12 --title "[LEX][E03] Testing & Quality Assurance"
gh issue edit 13 --title "[LEX][E04] Production Deployment & Launch"

# Testing stories (Epic 3 - Testing & QA)
Write-Host "Updating Testing stories (E03)..." -ForegroundColor Cyan
gh issue edit 27 --title "[LEX][E03_01] Unit Testing for RichMessageEditor Components"
gh issue edit 28 --title "[LEX][E03_02] Integration Testing with Chat Components"
gh issue edit 29 --title "[LEX][E03_03] Performance Testing and Optimization"
gh issue edit 30 --title "[LEX][E03_04] Cross-Browser Compatibility Testing"
gh issue edit 31 --title "[LEX][E03_05] Accessibility Compliance Testing (WCAG 2.1 AA)"
gh issue edit 32 --title "[LEX][E03_06] End-to-End Testing and Final Validation"

# Rich Text Features stories (Epic 1)
Write-Host "Updating Rich Text Features stories (E01)..." -ForegroundColor Cyan
gh issue edit 35 --title "[LEX][E01_01] Implement AutoLink Plugin for URL Detection"
gh issue edit 36 --title "[LEX][E01_02] Add List Support (Ordered and Unordered)"

Write-Host "`nAll issues updated to [LEX] prefix!" -ForegroundColor Green

# Update Epic 3 body with LEX prefix
Write-Host "`nUpdating Epic 3 (Testing & QA) body..." -ForegroundColor Cyan
$epic3Body = @"
## Overview
Ensure comprehensive testing coverage, performance optimization, and quality assurance for the Rich Message Composer before production deployment.

## 🎯 Success Criteria
- [ ] Unit test coverage >90% for all components
- [ ] Integration tests covering all user scenarios
- [ ] End-to-end tests for critical user journeys
- [ ] Performance benchmarks met and documented
- [ ] Cross-browser compatibility verified
- [ ] Accessibility compliance (WCAG 2.1 AA) validated

## 🔧 Child Issues - Testing Tasks

### Phase 1: Foundation Testing
- **#27 [LEX][E03_01] Unit Testing for RichMessageEditor Components** (2.5 points)
  - Comprehensive unit tests with >90% coverage
  - Mock API calls and test edge cases
  - Jest + React Testing Library implementation

### Phase 2: Integration Validation  
- **#28 [LEX][E03_02] Integration Testing with Chat Components** (2 points)
  - Real API integration testing
  - Message flow end-to-end validation
  - SerializedEditorState compliance verification

### Phase 3: Performance & Optimization
- **#29 [LEX][E03_03] Performance Testing and Optimization** (2 points)
  - <100ms latency validation
  - <50KB bundle size verification
  - Memory leak detection and optimization

### Phase 4: Compatibility Testing
- **#30 [LEX][E03_04] Cross-Browser Compatibility Testing** (1.5 points)
  - Desktop: Chrome, Firefox, Safari, Edge
  - Mobile: iOS Safari, Android Chrome, Firefox
  - Touch interaction and responsive testing

### Phase 5: Accessibility Validation
- **#31 [LEX][E03_05] Accessibility Compliance Testing (WCAG 2.1 AA)** (1.5 points)
  - Screen reader testing (NVDA, JAWS, VoiceOver)
  - Keyboard navigation validation
  - Color contrast and visual accessibility

### Phase 6: Final Validation
- **#32 [LEX][E03_06] End-to-End Testing and Final Validation** (2 points)
  - Complete user workflow testing
  - Production-like environment validation
  - Multi-user scenario testing

## 📊 Testing Metrics & Targets

Quality Gates:
- Unit Test Coverage: >90%
- Integration Test Coverage: 100% of user flows
- Performance: <100ms input latency (95th percentile)
- Bundle Size: <50KB increase gzipped
- Browser Compatibility: 4 major browsers + mobile
- Accessibility: WCAG 2.1 AA compliance
- E2E Coverage: All critical user journeys

## 🔄 Dependencies & Sequencing

Testing Phase Dependencies:
#27 (Unit) → #28 (Integration) → #29 (Performance)
                 ↓                    ↓
#30 (Cross-Browser) ← #31 (Accessibility)
                 ↓
            #32 (E2E Final)

## 📈 Progress Tracking

| Task | Status | Story Points | Estimated Duration |
|------|--------|--------------|-------------------|
| #27 Unit Testing | 🟡 Ready | 2.5 | 1 day |
| #28 Integration Testing | ⏳ Blocked | 2.0 | 0.75 day |
| #29 Performance Testing | ⏳ Blocked | 2.0 | 0.75 day |
| #30 Cross-Browser Testing | ⏳ Blocked | 1.5 | 0.5 day |
| #31 Accessibility Testing | ⏳ Blocked | 1.5 | 0.5 day |
| #32 E2E Final Testing | ⏳ Blocked | 2.0 | 0.75 day |
| **TOTAL** | | **11.5 points** | **4.25 days** |

## 🎯 Definition of Done
- [ ] All 6 testing task issues completed (#27-#32)
- [ ] Quality gates met for test coverage (>90%)
- [ ] Performance benchmarks achieved (<100ms latency)
- [ ] Browser compatibility confirmed (4+ browsers)
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Testing documentation complete and published
- [ ] CI/CD pipeline updated with new tests
- [ ] Production readiness assessment completed

## 📋 Next Steps
1. Start with #27 - Unit Testing (foundation for all other testing)
2. Set up testing infrastructure - CI/CD, test data, environments
3. Execute testing phases sequentially - Following dependency chain
4. Document results - Create testing report for stakeholders
5. Prepare for production deployment - Epic #13

---

**Epic Status**: Ready to Execute | **Total Effort**: 11.5 story points (~1 week)
**Critical Path**: Unit Testing → Integration → Performance → Cross-Browser → Accessibility → E2E
"@
$epic3Body | Out-File -FilePath "temp-epic-lex-3.md" -Encoding utf8
gh issue edit 12 --body-file "temp-epic-lex-3.md"
Remove-Item "temp-epic-lex-3.md"

Write-Host "`n[LEX] prefix update complete!" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "- Project Code: [LEX] (changed from [RMC])" -ForegroundColor Yellow
Write-Host "- Project Tracking: #20" -ForegroundColor Yellow
Write-Host "- Epic 1 (#10): Rich Text Features - 2 stories (#35-36)" -ForegroundColor Yellow
Write-Host "- Epic 2 (#11): Advanced Features & UX" -ForegroundColor Yellow
Write-Host "- Epic 3 (#12): Testing & QA - 6 stories (#27-32)" -ForegroundColor Yellow
Write-Host "- Epic 4 (#13): Production Deployment" -ForegroundColor Yellow
Write-Host "- Total: 4 Epics + 8 Stories" -ForegroundColor Yellow
