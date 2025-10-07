# GitHub Copilot Instructions - Project Task Implementation

This file provides instructions for GitHub Copilot (VS Code extension) to help implement tasks from GitHub issues following our project structure.

## How to Use This File

When you have a GitHub issue to implement, reference it in your Copilot chat like this:

```
@workspace implement the task from issue #[ISSUE_NUMBER]

Context:
- Parent Epic: #[EPIC_NUMBER] 
- Project: [PROJECT_NAME]
- See full requirements in the issue description
```

Then Copilot will use the instructions below to guide the implementation.

---

## Instructions for Copilot

When asked to implement a task from a GitHub issue, follow this process:

### 1. Understand the Task Context

First, review the issue structure:

- **Issue Title**: Extract the project code, epic, and story identifiers (e.g., `[ZSQ][E01_01]`)
- **Parent Epic**: Read the parent epic issue for overall context and architecture
- **User Story**: Understand the "As a/I want/So that" structure
- **Acceptance Criteria**: These define what "done" looks like
- **Technical Details**: Files to modify, technologies involved, implementation approach
- **Definition of Done**: Checklist items that must be completed

### 2. Gather Related Context

Before starting implementation:

1. **Read the parent epic** to understand the bigger picture
2. **Review related issues** mentioned in the issue description
3. **Check existing patterns** in files similar to those you'll modify
4. **Look for documentation** in the `docs/` folder related to the feature
5. **Identify dependencies** on other issues or code

### 3. Plan the Implementation

Create a step-by-step plan that:

1. Lists all files that need to be created or modified
2. Describes the changes needed in each file
3. Identifies any dependencies or prerequisites
4. Notes any potential risks or edge cases
5. Plans for testing the changes

### 4. Follow Project Patterns

This project uses specific patterns. Always:

- **Match existing code style** in the files you're modifying
- **Use the same libraries and frameworks** already in use
- **Follow naming conventions** found in similar files
- **Maintain consistency** with existing architecture
- **Respect the monorepo structure** (apps/, libs/, docs/, tools/)

### 5. Implementation Guidelines

When implementing:

#### For TypeScript/NestJS Backend Code:
- Use dependency injection patterns
- Follow the existing module/controller/service structure
- Use DTOs for data validation
- Add proper error handling
- Use ConfigService for environment variables

#### For React/Frontend Code:
- Use existing component patterns
- Follow the hooks and context patterns in use
- Match the existing state management approach
- Use TypeScript interfaces for props

#### For Configuration Files:
- Update `.env` files with new environment variables
- Document variables in `.env.example` files
- Update relevant README files
- Note any deployment requirements

#### For Database/MongoDB:
- Use Mongoose schemas if working with data models
- Follow existing schema patterns
- Consider indexes and performance
- Document any migration requirements

### 6. Testing Requirements

For each implementation:

1. **Manual Testing**: Describe how to manually test the feature
2. **Unit Tests**: Add/update unit tests if applicable
3. **Integration Tests**: Consider integration test needs
4. **Error Cases**: Test error handling and edge cases
5. **Documentation**: Update docs with testing instructions

### 7. Documentation Updates

Always update:

1. **README files**: If feature affects setup or usage
2. **API documentation**: For new endpoints or interfaces
3. **Configuration docs**: For new environment variables
4. **Code comments**: For complex logic or important decisions
5. **Definition of Done**: Check off completed items in the issue

### 8. Commit Strategy

Structure commits as:

```
[PROJECT][EPIC_STORY] Brief description

- Detailed change 1
- Detailed change 2
- Related to #[ISSUE_NUMBER]
```

Example:
```
[ZSQ][E01_01] Configure Zero-Cache query endpoint

- Add ZERO_GET_QUERIES_URL environment variable
- Update configuration documentation
- Add health check verification
- Related to #66
```

## Task Structure Reference

GitHub issues in this project follow this structure:

### Issue Title Format
```
[PROJECT_CODE][EPIC_ID] Task Description
```
Example: `[ZSQ][E01_01] Configure Zero-Cache Query Endpoint`

### Issue Body Structure

**Priority**: High/Medium/Low  
**Estimated Effort**: X days  
**Parent Epic**: link to parent issue

#### User Story
```
As a [Role]
I want [Feature/Capability]
So that [Business Value]
```

#### Background/Context
Why this work is needed and what problem it solves.

#### Acceptance Criteria
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2
- [ ] etc.

#### Technical Details
- **Files to modify**: List of specific file paths
- **Technologies**: Relevant tech stack items
- **Implementation approach**: High-level strategy
- **Environment variables**: Any new config needed

#### Testing Requirements
- [ ] How to test manually
- [ ] Automated test needs
- [ ] Edge cases to verify

#### Definition of Done
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Verified in environment

---

## Example Prompt for Copilot

When you need to implement an issue, structure your prompt like this:

```markdown
@workspace I need to implement issue #66: [ZSQ][E01_01] Configure Zero-Cache Query Endpoint

**Context:**
- Parent Epic: #61 - Synced Query Infrastructure Setup
- Full project scope: docs/projects/zrocket-synced-queries/

**Task Summary:**
As a DevOps Engineer, I want Zero-cache configured to forward query requests to our 
API so that clients can use synced queries with server-side filtering.

**What needs to be done:**
1. Add ZERO_GET_QUERIES_URL environment variable
2. Configure Zero-cache routing
3. Verify connection in logs
4. Update documentation

**Technical Details:**
- Files: apps/source-mongodb-server/.env, apps/zrocket/.env
- Variable: ZERO_GET_QUERIES_URL="http://localhost:3000/api/zero/get-queries"
- Need to test routing with curl/Postman

**Acceptance Criteria:**
- [ ] Zero-cache forwards requests to NestJS API
- [ ] Connection verified in logs
- [ ] Health check confirms connectivity
- [ ] Documentation updated

Please help me:
1. Review related code and patterns
2. Create an implementation plan
3. Guide me through the changes
4. Help verify the implementation
```

## Project-Specific Context

### Repository Structure
```
zero-sources/
├── apps/
│   ├── source-mongodb-server/    # Zero change source server
│   └── zrocket/                   # Main NestJS application
├── libs/                          # Shared libraries
├── docs/
│   └── projects/                  # Project documentation
│       └── zrocket-synced-queries/
└── tools/                         # Build and dev tools
```

### Key Technologies
- **Backend**: NestJS, Mongoose, MongoDB
- **Frontend**: React, React Router, Zero (rocicorp)
- **Build**: Turborepo, pnpm
- **Deployment**: Docker Compose

### Environment Configuration
- `.env` files are used for configuration
- `.env.example` files document available variables
- Configuration is loaded via NestJS ConfigService
- Secrets should never be committed

### Development Workflow
1. Create feature branch from main: `<issue-number>-<short-description>`
2. Implement following the issue requirements
3. Test locally with Docker Compose
4. Update documentation
5. Create PR referencing the issue
  - NOTE: if the PR body contains characters that need escaping use a file instead of direct console input
6. Wait for review and CI checks

### Common Patterns

#### Adding a New Environment Variable
1. Add to `.env` file(s)
2. Add to `.env.example` with description
3. Add to TypeScript config interface if using ConfigService
4. Document in relevant README
5. Update deployment docs if needed

#### Creating a NestJS Endpoint
1. Define DTO for request/response
2. Create/update controller with endpoint
3. Implement service layer logic
4. Add to module providers/exports
5. Document in API docs
6. Add integration tests

#### Working with Zero/MongoDB
1. Follow existing schema patterns
2. Use virtual tables where appropriate
3. Consider Zero sync requirements
4. Test with Zero client

---

## Working with Related Issues

When an issue references other issues:

### Reading Parent Epics
Ask Copilot:
```
@workspace show me the full context of epic #61 including all child issues
```

### Understanding Related Issues
```
@workspace what issues are related to #66? Show me their status and how they connect.
```

### Finding Similar Implementations
```
@workspace find similar implementations to what's described in issue #66. 
Show me patterns I should follow.
```

---

## Quality Checklist

Before marking an issue as complete, verify:

### Code Quality
- [ ] Follows TypeScript best practices
- [ ] Matches existing code style
- [ ] Has appropriate error handling
- [ ] Includes JSDoc comments for public APIs
- [ ] No console.logs or debug code left in

### Functionality
- [ ] All acceptance criteria met
- [ ] Manually tested and working
- [ ] Edge cases handled
- [ ] Error cases tested
- [ ] Performance is acceptable

### Documentation
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Configuration documented
- [ ] Comments explain complex logic
- [ ] Deployment notes if applicable

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No regressions introduced
- [ ] CI pipeline passes

### Git/PR
- [ ] Commits are clear and focused
- [ ] PR description references issue
- [ ] Branch name follows convention
- [ ] No merge conflicts
- [ ] Ready for code review

---

## Troubleshooting Guide

### If Copilot doesn't have enough context:

1. **Be more specific about the issue:**
   ```
   @workspace read issue #66 and its parent epic #61, then show me what files 
   need to be modified and what changes are required
   ```

2. **Point to specific files:**
   ```
   @workspace look at apps/source-mongodb-server/.env and 
   apps/zrocket/.env - I need to add ZERO_GET_QUERIES_URL based on issue #66
   ```

3. **Reference documentation:**
   ```
   @workspace check docs/projects/zrocket-synced-queries/PRD.md for the 
   architecture, then help me implement issue #66
   ```

### If you need to understand patterns:

```
@workspace show me how environment variables are currently handled in this 
project, then help me add ZERO_GET_QUERIES_URL following the same pattern
```

### If you're unsure about dependencies:

```
@workspace analyze issue #66 and tell me:
1. What other issues it depends on
2. What issues depend on it  
3. What order to implement things in
```

---

## Tips for Effective Copilot Usage

1. **Always reference the issue number** so Copilot can find it
2. **Mention parent epic** for broader context
3. **Point to specific documentation** when available
4. **Ask for patterns first** before implementing
5. **Request step-by-step plans** for complex tasks
6. **Verify understanding** by asking Copilot to summarize
7. **Use @workspace** to access repository context
8. **Reference specific files** to focus Copilot's attention
9. **Ask for code review** after implementation
10. **Request testing guidance** to ensure quality

---

## Related Documentation

- Project documentation: `docs/projects/zrocket-synced-queries/`
- Architecture decisions: `docs/` folder
- Setup guides: Repository README files
- API documentation: NestJS Swagger endpoints


