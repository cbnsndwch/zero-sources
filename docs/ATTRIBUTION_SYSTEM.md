# Attribution System Documentation

This document explains the multi-layered attribution system implemented for the `@cbnsndwch/zero-sources` repository.

## Overview

The attribution system protects **cbnsndwch LLC** legally while properly acknowledging all external contributions, inspirations, and dependencies. It consists of multiple complementary components that work together.

---

## System Components

### 1. **ACKNOWLEDGMENTS.md** (Detailed Attributions)

**Purpose**: Comprehensive list of all external projects, inspirations, and dependencies.

**Location**: `./ACKNOWLEDGMENTS.md`

**Contains**:

- ✅ Direct dependencies (Rocicorp Zero, NestJS, etc.)
- ✅ Inspirational sources (Rocket.Chat domain model)
- ✅ Development tools (Turborepo, pnpm, Changesets)
- ✅ Database technologies
- ✅ Testing frameworks
- ✅ All significant third-party influences

**When to Update**:

- Adding a new major dependency
- Drawing inspiration from a new external project
- Adapting code patterns from other sources
- Changing technology stack components

**Key Sections**:

- Core Dependencies & Inspirations
- Inspirational Sources & Design Influences (non-dependencies)
- Development Tools & Infrastructure
- Database & Data Technologies
- Testing & Quality Tools
- Documentation & Learning Resources

---

### 2. **CONTRIBUTING.md** (Contributor Guidelines + CLA)

**Purpose**: Complete contribution guidelines with legal protections.

**Location**: `./CONTRIBUTING.md`

**Key Features**:

#### A. Contributor License Agreement (CLA)

- **Requirement**: All contributors must sign before first PR is merged
- **Protection**: Contributors grant cbnsndwch LLC MIT license rights
- **Process**: Simple comment-based signing on first PR
- **Corporate CLA**: Available for company contributors

#### B. Attribution Requirements Section

- Guidelines for attributing external code
- Code comment templates for direct adaptations
- Rules for inspired-by acknowledgments
- License compatibility requirements
- Instructions to update ACKNOWLEDGMENTS.md

**Attribution Templates Provided**:

```typescript
// Direct adaptation template
/**
 * Adapted from: [Project Name] ([URL])
 * Original Author: [Author Name]
 * Original License: [License Type]
 * Changes made: [Description]
 */

// Inspiration template
/**
 * Implementation inspired by [Project Name]'s approach to [feature]
 * See: [URL]
 * This is an independent implementation adapted for our use case.
 */
```

---

### 3. **README.md** (High-Level Overview)

**Purpose**: Brief acknowledgments with links to detailed documentation.

**Location**: `./README.md`

**Acknowledgments Section Includes**:

- Top-level thanks to major projects (Rocicorp Zero, NestJS)
- Special mention of Rocket.Chat inspiration
- Link to full ACKNOWLEDGMENTS.md
- Updated Contributing section with CLA notice

**Key Changes Made**:

- ✅ Expanded acknowledgments with Rocket.Chat mention
- ✅ Added prominent link to ACKNOWLEDGMENTS.md
- ✅ Enhanced Contributing section with CLA warning
- ✅ Added links to full CONTRIBUTING.md guide

---

### 4. **Pull Request Template** (Enforcement)

**Purpose**: Ensure contributors follow attribution and CLA requirements.

**Location**: `.github/PULL_REQUEST_TEMPLATE.md`

**Key Sections**:

#### CLA Section

- Checkbox reminder for first-time contributors
- Full CLA statement template to paste as comment
- Corporate contributor pathway
- Link to detailed CLA docs

#### Attribution & Licensing Section

- Checkboxes for external code usage
- Requirements list for proper attribution
- Space to list sources used
- Link to ACKNOWLEDGMENTS.md

**Enforces**:

- ✅ CLA signing for new contributors
- ✅ Proper attribution of external code
- ✅ License compatibility verification
- ✅ Update of ACKNOWLEDGMENTS.md when needed

---

### 5. **Issue Templates** (Community Engagement)

**Purpose**: Standardize bug reports and feature requests.

**Location**: `.github/ISSUE_TEMPLATE/`

**Templates Created**:

- `bug_report.md` - Structured bug reporting
- `feature_request.md` - Feature proposal format

---

## Different Types of Attribution

### Type 1: Direct Dependencies

**What**: npm packages in `package.json`
**Where**: Listed in ACKNOWLEDGMENTS.md
**Example**: `@rocicorp/zero`, `@nestjs/core`
**License Handling**: Automatically included via `node_modules/*/LICENSE`

### Type 2: Inspirational Sources (Non-Dependencies)

**What**: Projects that influenced design but aren't direct dependencies
**Where**:

- ACKNOWLEDGMENTS.md (detailed)
- README.md (brief mention)
  **Example**: Rocket.Chat domain model inspiration for zrocket
  **Attribution Required**: Yes, with clear disclaimer about independent implementation

### Type 3: Borrowed Code Patterns

**What**: Specific code implementations adapted from other projects
**Where**:

- Inline code comments (with template)
- ACKNOWLEDGMENTS.md (if significant)
  **Example**: Algorithm adaptation from Stack Overflow, GitHub repos
  **Requirements**:
- License compatibility check
- Inline attribution comment
- Update ACKNOWLEDGMENTS.md for major borrowings

### Type 4: Learned Techniques

**What**: General programming patterns, best practices
**Where**: ACKNOWLEDGMENTS.md under "Documentation & Learning Resources"
**Example**: Twelve-Factor App principles, Conventional Commits
**Attribution Level**: Acknowledgment sufficient

---

## Workflows

### For Contributors (Incoming)

#### Workflow A: Contributing Original Code

1. Read CONTRIBUTING.md
2. Develop feature/fix
3. Create PR using template
4. Sign CLA in PR comment (first time)
5. No additional attribution needed

#### Workflow B: Contributing Adapted/Inspired Code

1. Read CONTRIBUTING.md attribution section
2. Check license compatibility
3. Add inline attribution comments using templates
4. Update ACKNOWLEDGMENTS.md if significant
5. Create PR using template
6. Fill out "Attribution & Licensing" section
7. Sign CLA in PR comment (first time)

### For Maintainers (Managing)

#### Code Review Checklist:

- [ ] CLA signed (for first-time contributors)
- [ ] External code properly attributed
- [ ] ACKNOWLEDGMENTS.md updated (if needed)
- [ ] License compatibility verified
- [ ] Inline comments present for adapted code

---

## Legal Protections

### What This System Protects:

1. **cbnsndwch LLC** from:
    - Copyright infringement claims
    - License violation accusations
    - Contributor disputes over ownership
    - GPL/copyleft contamination

2. **Contributors** by:
    - Clarifying ownership (they keep copyright)
    - Defining usage rights (MIT grant)
    - Protecting against employer disputes (certification)
    - Providing clear process

3. **The Project** by:
    - Ensuring all contributions are properly licensed
    - Maintaining license compliance
    - Building trust with community
    - Creating audit trail

### License Compatibility

**Acceptable** (compatible with MIT):

- ✅ MIT
- ✅ Apache-2.0
- ✅ BSD (2-clause, 3-clause)
- ✅ ISC
- ✅ CC0 (public domain)

**Requires Approval** (copyleft or complex):

- ⚠️ GPL, LGPL, AGPL
- ⚠️ MPL (Mozilla Public License)
- ⚠️ EPL (Eclipse Public License)

**Not Acceptable** (copyleft, commercial restrictions, or unclear):

- ❌ **SSPL** (Server Side Public License) - Strong copyleft, not OSI-approved
- ❌ **FSL** (Functional Source License) - Time-delayed commercial restriction
- ❌ **BSL** (Business Source License) - Time-delayed commercial restriction
- ❌ **Fair Source License** - User limit restrictions
- ❌ **Fair Code License** - Commercial use restrictions
- ❌ **Elastic License** - Commercial/SaaS restrictions
- ❌ **Commons Clause** - Prohibits commercial sale
- ❌ **CC BY-NC** (Creative Commons Non-Commercial) - Commercial use prohibited
- ❌ **Proprietary code** without explicit permission
- ❌ **Code with "no derivatives" restrictions**
- ❌ **Unlicensed code** (unclear ownership)

---

## Maintenance Guidelines

### Regular Updates

**Quarterly Review** (every 3 months):

- [ ] Review ACKNOWLEDGMENTS.md for accuracy
- [ ] Check if any major dependencies changed
- [ ] Update technology versions listed
- [ ] Verify all links still work

**After Major Changes**:

- [ ] New major dependency → Update ACKNOWLEDGMENTS.md
- [ ] New inspiration source → Update ACKNOWLEDGMENTS.md + README.md
- [ ] Technology stack change → Update all relevant docs

### When Issues Arise

**If someone claims missed attribution**:

1. Investigate immediately
2. Add proper attribution if valid
3. Thank the reporter
4. Update documentation
5. Consider process improvement

**If license violation claimed**:

1. Contact legal@cbnsndwch.com
2. Investigate the code history
3. Obtain legal guidance
4. Take corrective action
5. Document resolution

---

## Best Practices Summary

### For This Repository:

1. **Always acknowledge inspiration** - Even if you rewrote everything
2. **Over-attribute rather than under-attribute** - It's safer
3. **Check licenses before borrowing** - Save time later
4. **Update docs immediately** - Don't defer attribution
5. **Be specific** - Link to exact files/commits when possible
6. **Keep records** - Git history + comments = audit trail

### For Contributors:

1. **Read CONTRIBUTING.md first** - Know the requirements
2. **Ask if unsure** - Better to ask than assume
3. **Attribute generously** - Respect others' work
4. **Sign CLA promptly** - Don't delay the process
5. **Be honest** - About sources and ownership

---

## Examples

### Example 1: Using Rocket.Chat Pattern

**Scenario**: Studied Rocket.Chat's message entity structure for zrocket.

**Actions Taken**:

1. ✅ Added Rocket.Chat to ACKNOWLEDGMENTS.md under "Inspirational Sources"
2. ✅ Mentioned in README.md acknowledgments
3. ✅ Noted: "No code directly copied, concepts reimplemented"
4. ✅ Provided links to Rocket.Chat repo and docs

**Result**: Clear attribution, legal protection, community respect.

### Example 2: Adapting Algorithm from GitHub

**Scenario**: Found efficient sorting algorithm in another MIT-licensed project.

**Actions Needed**:

1. Check license (MIT ✅)
2. Add inline comment:

```typescript
/**
 * Adapted from: project-name (https://github.com/user/repo/blob/main/file.ts)
 * Original Author: Jane Developer
 * Original License: MIT
 * Changes made: Modified to work with TypeScript types, added error handling
 */
```

3. If significant: Add to ACKNOWLEDGMENTS.md
4. Note in PR template under "Attribution & Licensing"

### Example 3: Learning from Documentation

**Scenario**: Implemented feature based on AWS SDK documentation patterns.

**Actions Needed**:

1. Add to ACKNOWLEDGMENTS.md under "Documentation & Learning Resources"
2. Brief mention: "Patterns learned from AWS SDK documentation"
3. No inline comments needed (general knowledge)

---

## Contact & Questions

**Attribution Questions**: Open a discussion on GitHub or ask in Discord  
**Legal Concerns**: legal@cbnsndwch.com  
**General Contribution Help**: CONTRIBUTING.md or Discord @cbnsndwch

---

**Document Version**: 1.0  
**Last Updated**: October 4, 2025  
**Maintained By**: cbnsndwch LLC
