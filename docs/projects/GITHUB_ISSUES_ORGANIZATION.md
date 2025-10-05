# GitHub Issues Organization Summary

**Last Updated**: October 5, 2025

## Overview

All open GitHub issues have been organized into project-based structures with consistent naming conventions and hierarchical tracking.

## Project Structure

### 1. [ZSQ] Zrocket Synced Queries

**Project Location**: `docs/projects/zrocket-synced-queries/`
**Project Code**: [ZSQ]
**Issues**: #61-#94 (34 issues total)

**Epics**:
- #61 - [ZSQ][E01] Synced Query Infrastructure Setup (4 stories)
- #62 - [ZSQ][E02] Query Definitions and Client Integration (8 stories)
- #63 - [ZSQ][E03] Server-Side Permission Enforcement (5 stories)
- #64 - [ZSQ][E04] Testing and Quality Assurance (6 stories)
- #65 - [ZSQ][E05] Deployment and Monitoring (6 stories)

**Total**: 5 Epics + 29 Stories = 34 Issues

**Documentation**:
- PRD: `docs/projects/zrocket-synced-queries/PRD.md`
- Epics & Stories: `docs/projects/zrocket-synced-queries/EPICS_AND_STORIES.md`

---

### 2. [LEX] Rich Message Composer - Lexical Integration

**Project Location**: `docs/projects/proj-rich-message-composer/`
**Project Code**: [LEX]
**Issues**: #10-#36 (14 open issues)

**Project Tracking**: #20

**Epics**:
- #10 - [LEX][E01] Rich Text Features Implementation (2 stories)
- #11 - [LEX][E02] Advanced Features & User Experience (partially complete)
- #12 - [LEX][E03] Testing & Quality Assurance (6 stories)
- #13 - [LEX][E04] Production Deployment & Launch (TBD stories)

**Total**: 4 Epics + 8 Stories + 1 Project Tracking = 13 Issues

**Documentation**:
- PRD: `docs/projects/proj-rich-message-composer/PRD.md`
- Epics & Stories: `docs/projects/proj-rich-message-composer/EPICS_AND_STORIES.md`
- Technical Architecture: `docs/projects/proj-rich-message-composer/technical-architecture.md`
- Testing Strategy: `docs/projects/proj-rich-message-composer/TESTING_STRATEGY.md`
- Project Plan: `docs/projects/proj-rich-message-composer/PROJECT_PLAN.md`

---

## Naming Convention

All issues follow this consistent naming pattern:

```
[PROJECT_CODE][TYPE] Description

Examples:
- [ZSQ][E01] Epic Title
- [ZSQ][E01_01] Story Title
- [LEX][E03_02] Story Title
- [LEX][PROJECT] Project Tracking
```

### Format Components

- **PROJECT_CODE**: Short 2-4 letter project identifier
  - ZSQ = Zrocket Synced Queries
  - LEX = Lexical Editor Integration
  
- **TYPE**: Issue type
  - `[E##]` = Epic (e.g., E01, E02)
  - `[E##_##]` = Story under epic (e.g., E01_01, E02_03)
  - `[PROJECT]` = Project tracking issue

## Issue Statistics

### By Project

| Project | Epics | Stories | Total Issues | Status |
|---------|-------|---------|--------------|--------|
| ZSQ | 5 | 29 | 34 | All created |
| LEX | 4 | 8+ | 13+ | Partially organized |
| **TOTAL** | **9** | **37+** | **47** | **Active** |

### By Priority

| Priority | Count | Projects |
|----------|-------|----------|
| Critical | 8 | ZSQ (3), LEX (5) |
| High | 35 | ZSQ (26), LEX (9) |
| Medium | 4 | ZSQ (4) |

### By Component

| Component | Count |
|-----------|-------|
| Frontend | 12 |
| Backend | 15 |
| Infrastructure | 12 |
| Testing | 8 |

## Loose Issues

**Status**: None identified

All open issues (1-100) have been reviewed and are organized into the two active projects:
- Issues #10-36: [LEX] Rich Message Composer - Lexical Integration
- Issues #61-94: [ZSQ] Zrocket Synced Queries

## Project Folders Structure

```
docs/projects/
├── proj-rich-message-composer/    [LEX]
│   ├── PRD.md
│   ├── EPICS_AND_STORIES.md
│   ├── PROJECT_PLAN.md
│   ├── technical-architecture.md
│   ├── TESTING_STRATEGY.md
│   └── implementation-guide.md
│
├── zrocket-synced-queries/        [ZSQ]
│   ├── PRD.md
│   └── EPICS_AND_STORIES.md
│
├── zrocket/                        [General Zrocket docs]
└── 3-node-architecture/            [Infrastructure docs]
```

## Next Steps

### For Future Projects

When creating new projects, follow this process:

1. **Create Project Folder**
   ```
   docs/projects/[project-name]/
   ```

2. **Assign Project Code**
   - 2-4 letter abbreviation (e.g., ZSQ, LEX)
   - Use in all related issues

3. **Create Core Documents**
   - `PRD.md` - Product Requirements Document
   - `EPICS_AND_STORIES.md` - Epic and story breakdown
   - Additional technical docs as needed

4. **Create GitHub Issues**
   - Use naming convention: `[CODE][TYPE] Title`
   - Create epics first
   - Create stories linked to parent epics
   - Update epic bodies with child issue references

5. **Update This Document**
   - Add project to the summary
   - Update statistics
   - Document project structure

### For Loose Issues

If loose issues are identified in the future:

1. **Analyze Issue**
   - Determine if it belongs to an existing project
   - Check if it's a standalone task
   - Assess if it needs a new project

2. **Document in Temporary Tracking**
   - Create entry in `docs/projects/LOOSE_ISSUES.md`
   - Include issue number, title, and analysis
   - Mark for future organization

3. **Regular Review**
   - Weekly review of loose issues
   - Assign to projects or close if obsolete
   - Create new projects if patterns emerge

## Maintenance

### Weekly Tasks

- [ ] Review new issues for project assignment
- [ ] Update issue naming conventions
- [ ] Update project statistics
- [ ] Review and close completed issues

### Monthly Tasks

- [ ] Audit project structure completeness
- [ ] Update PRDs with learnings
- [ ] Review epic progress and adjust priorities
- [ ] Generate project status reports

---

## Tools and Scripts

### Available Scripts

Located in repository root:

1. **create-issues.ps1**
   - Creates GitHub issues from epic/story definitions
   - Links stories to parent epics
   - Applies proper labels

2. **link-issues.ps1**
   - Links stories as sub-issues to parent epics
   - Updates epic bodies with child issue lists

3. **update-to-lex.ps1**
   - Updates LEX project issues with proper naming
   - Applies [LEX] prefix to all related issues

### Using gh CLI

Common commands for issue management:

```powershell
# List all open issues
gh issue list --state open --limit 100

# View issue details
gh issue view <number>

# Edit issue title
gh issue edit <number> --title "New Title"

# Add labels
gh issue edit <number> --add-label "priority:high"

# Link issues (in issue body)
# Use "Parent Epic: #<number>" or "Depends on: #<number>"
```

---

*This document is automatically updated as part of project organization activities.*
