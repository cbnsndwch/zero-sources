# Contributing to zero-sources Documentation

Thank you for your interest in improving the zero-sources documentation! We welcome contributions from the community that help make our documentation more clear, comprehensive, and useful.

## Quick Start

1. **Fork and clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Start the docs server**: `pnpm --filter docs dev`
4. **Make your changes** in `apps/docs/content/docs/`
5. **Preview your changes** at `http://localhost:3000`
6. **Submit a pull request**

## What Can You Contribute?

### Content Improvements

- **Fix typos and grammar**: Even small corrections help!
- **Clarify confusing sections**: If something was unclear to you, it's probably unclear to others
- **Add examples**: Real-world examples make documentation more valuable
- **Update outdated information**: Help us keep docs current with code changes

### New Content

- **Write new guides**: Share your knowledge about using zero-sources
- **Create tutorials**: Step-by-step walkthroughs for common tasks
- **Document best practices**: Share patterns and approaches that work well
- **Add troubleshooting tips**: Help others avoid or solve problems you've encountered

### Structure and Organization

- **Improve navigation**: Suggest better ways to organize content
- **Add cross-references**: Link related topics together
- **Create tables of contents**: Make long documents easier to navigate
- **Enhance search**: Improve metadata and keywords for better discoverability

## Documentation Structure

Our documentation is built with [Fumadocs](https://fumadocs.dev//) and organized as follows:

```
apps/docs/
├── content/docs/              # Main documentation content
│   ├── getting-started/       # Quick start guides
│   ├── guides/                # How-to guides
│   ├── packages/              # Library documentation
│   ├── change-sources/        # Change source implementations
│   ├── architecture/          # System architecture
│   ├── api/                   # API reference
│   └── contributing/          # Contribution guides (you are here!)
├── templates/                 # MDX templates for new pages
├── components/                # React components for docs
├── STYLE_GUIDE.md            # Content style guidelines
└── CONTRIBUTING.md           # This file
```

## Before You Start

1. **Check existing issues**: See if someone is already working on similar changes
2. **Read our [Style Guide](./STYLE_GUIDE.md)**: Understand our writing conventions
3. **Review [templates](./templates/)**: Use templates for consistent structure
4. **Look at existing docs**: Follow patterns used in similar pages

## Writing Guide

### MDX Files

Our documentation uses MDX (Markdown + JSX), which allows you to embed React components in markdown:

```mdx
---
title: Your Page Title
description: A brief description for SEO and previews
---

# Your Page Title

Regular markdown content here...

<Callout type="info">
  This is a custom component for highlighting information.
</Callout>

## Code Examples

```typescript
// TypeScript code with syntax highlighting
import { Zero } from '@rocicorp/zero';
```
```

### Frontmatter

Every MDX file should start with frontmatter:

```yaml
---
title: Page Title (required)
description: Brief description for SEO (required)
---
```

### Custom Components

We provide several custom components for rich documentation:

- `<Callout type="info|warning|error|success">` - Highlighted boxes
- `<Card>`, `<Cards>` - Card layouts
- `<Tabs>`, `<Tab>` - Tabbed content
- `<Steps>` - Step-by-step instructions

See examples in existing documentation.

## Style Guidelines

### Writing Style

- **Be clear and concise**: Get to the point quickly
- **Use active voice**: "Click the button" not "The button should be clicked"
- **Write for your audience**: Assume readers are developers familiar with TypeScript
- **Use examples**: Show, don't just tell
- **Be consistent**: Follow patterns established in existing docs

### Code Examples

- **Keep examples short**: Focus on the relevant parts
- **Include context**: Show imports and setup when necessary
- **Test your examples**: Make sure code actually works
- **Add comments**: Explain non-obvious parts
- **Use TypeScript**: Show types when helpful

```typescript
// ✅ Good - Clear, complete, commented
import { Zero } from '@rocicorp/zero';
import { schema } from './schema';

// Initialize Zero client
const zero = new Zero({
  server: process.env.ZERO_SERVER_URL,
  schema,
  userID: 'user-123',
});

// Query messages in real-time
const messages = zero.query.message
  .where('roomId', '=', roomId)
  .orderBy('createdAt', 'desc');
```

### Formatting

- **Headings**: Use proper hierarchy (H1 → H2 → H3)
- **Lists**: Use bullets for unordered, numbers for steps
- **Bold**: For UI elements and emphasis
- **Code**: Use backticks for inline code, blocks for multi-line
- **Links**: Use descriptive link text, not "click here"

## Local Development

### Prerequisites

- Node.js v22 or higher
- pnpm v8 or higher

### Setup

```bash
# Clone the repository
git clone https://github.com/cbnsndwch/zero-sources.git
cd zero-sources

# Install dependencies
pnpm install

# Start the docs development server
pnpm --filter docs dev
```

The documentation site will be available at `http://localhost:3000`.

### Making Changes

1. Create a new branch: `git checkout -b docs/your-feature-name`
2. Make your changes in `apps/docs/content/docs/`
3. Preview changes in your browser
4. Commit your changes: `git commit -m "docs: describe your changes"`
5. Push to your fork: `git push origin docs/your-feature-name`
6. Open a pull request

### Testing

Before submitting your PR:

- [ ] Preview your changes locally
- [ ] Check for broken links
- [ ] Verify code examples work
- [ ] Run the linter: `pnpm --filter docs lint`
- [ ] Check spelling and grammar
- [ ] Ensure images load correctly

## Pull Request Process

1. **Create descriptive PR title**: Start with "docs:" prefix
   - Example: `docs: add guide for custom change sources`

2. **Fill out PR template**: Provide context and describe changes

3. **Link related issues**: Reference any related issue numbers

4. **Request review**: Tag relevant maintainers if needed

5. **Address feedback**: Respond to review comments promptly

6. **Keep PR focused**: One topic per PR when possible

### PR Guidelines

- **Small, focused changes**: Easier to review and merge
- **Clear commit messages**: Describe what and why
- **Update related docs**: Keep everything consistent
- **Add yourself to contributors**: We appreciate your help!

## Getting Help

- **Questions**: Open a [GitHub Discussion](https://github.com/cbnsndwch/zero-sources/discussions)
- **Bugs**: Open a [GitHub Issue](https://github.com/cbnsndwch/zero-sources/issues)
- **Clarifications**: Ask in your PR or issue comments

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. By contributing, you agree to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what's best for the community

## Recognition

All contributors will be recognized in our documentation and release notes. Thank you for helping make zero-sources better!

## Additional Resources

- [Style Guide](./STYLE_GUIDE.md) - Detailed writing guidelines
- [Templates](./templates/) - Starting points for new pages
- [Fumadocs Documentation](https://fumadocs.dev//) - Framework documentation
- [Project Contributing Guide](../../CONTRIBUTING.md) - For code contributions

---

**Questions?** Feel free to ask in your PR or open a discussion. We're here to help!
