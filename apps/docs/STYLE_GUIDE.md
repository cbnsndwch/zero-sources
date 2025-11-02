# zero-sources Documentation Style Guide

This guide ensures consistency, clarity, and quality across all zero-sources documentation.

## Table of Contents

- [Writing Principles](#writing-principles)
- [Voice and Tone](#voice-and-tone)
- [Grammar and Mechanics](#grammar-and-mechanics)
- [Formatting Standards](#formatting-standards)
- [Code Examples](#code-examples)
- [MDX Components](#mdx-components)
- [File Organization](#file-organization)

## Writing Principles

### 1. Clarity First

Write for understanding, not to impress. If a sentence is complex, break it into simpler ones.

```markdown
❌ The facilitation of real-time synchronization is accomplished through the utilization of WebSocket protocols.

✅ Real-time synchronization works through WebSocket connections.
```

### 2. Be Concise

Respect the reader's time. Remove unnecessary words.

```markdown
❌ In order to get started with using zero-sources in your project, you will need to first install the required dependencies.

✅ To start using zero-sources, install the dependencies.
```

### 3. Show, Don't Just Tell

Provide concrete examples alongside explanations.

```markdown
❌ You can filter queries using comparison operators.

✅ Filter queries with comparison operators like `where('age', '>', 18)`.
```

### 4. Write for Scanning

Use headings, bullets, and formatting to help readers find information quickly.

## Voice and Tone

### Voice

Our documentation voice is:

- **Professional** but not stuffy
- **Helpful** but not condescending  
- **Technical** but not intimidating
- **Clear** but not oversimplified

### Tone by Content Type

**Guides and Tutorials**: Encouraging and supportive
```markdown
✅ Great! You've successfully connected to your change source.
```

**Reference Documentation**: Precise and factual
```markdown
✅ Returns a Promise that resolves to an array of messages.
```

**Error Messages**: Helpful and actionable
```markdown
✅ Connection failed. Check that your MONGODB_URI environment variable is set.
```

## Grammar and Mechanics

### Active vs. Passive Voice

Prefer active voice for clarity and directness.

```markdown
❌ The schema is defined by the developer.
✅ Define the schema in your configuration.

❌ Changes are streamed to clients by the change source.
✅ The change source streams changes to clients.
```

### Second Person

Address the reader directly using "you" (or implied "you").

```markdown
❌ Developers should configure their environment variables.
✅ Configure your environment variables.

❌ One must ensure the database connection is established.
✅ Ensure the database connection is established.
```

### Present Tense

Use present tense when describing how things work.

```markdown
❌ The client will connect to the server.
✅ The client connects to the server.

❌ This function returned a promise.
✅ This function returns a promise.
```

### Contractions

Use contractions for a conversational tone in guides, avoid them in reference docs.

```markdown
✅ Guide: You'll need to install dependencies first.
✅ Reference: The function returns null if the user is not found.
```

## Formatting Standards

### Headings

Use sentence case for headings (capitalize only the first word and proper nouns).

```markdown
❌ ## How To Configure Your Change Source
✅ ## How to configure your change source

❌ ## getting started with Zero
✅ ## Getting started with Zero
```

Maintain proper heading hierarchy:

```markdown
✅ Correct hierarchy:
# Page Title (H1)
## Main Section (H2)
### Subsection (H3)
#### Detail (H4)

❌ Don't skip levels:
# Page Title (H1)
### Subsection (H3) ← skipped H2
```

### Lists

**Unordered lists** for items without sequence:

```markdown
The library provides:
- Real-time synchronization
- Offline support
- Type-safe queries
```

**Ordered lists** for sequential steps:

```markdown
To deploy your application:
1. Build the production bundle
2. Configure environment variables
3. Start the Docker services
```

**Parallel structure** - keep list items grammatically consistent:

```markdown
❌ Mixed structure:
- Configure the schema
- Starting the server
- You should test the connection

✅ Parallel structure:
- Configure the schema
- Start the server
- Test the connection
```

### Links

Use descriptive link text, not "click here" or bare URLs.

```markdown
❌ Click [here](./guide.md) to learn more.
❌ See https://github.com/cbnsndwch/zero-sources

✅ See the [deployment guide](./guide.md) for details.
✅ View the [zero-sources repository](https://github.com/cbnsndwch/zero-sources).
```

### Emphasis

**Bold** for UI elements, important terms, and strong emphasis:

```markdown
Click the **Save** button.
The **primary key** must be unique.
```

*Italic* for subtle emphasis or introducing terms:

```markdown
This is also called a *discriminated union*.
```

`Code formatting` for:
- Code elements: functions, variables, types
- File and directory names
- Commands and keyboard keys
- URLs in technical context

```markdown
The `useZero()` hook connects to the server.
Edit the `config.yml` file.
Run `pnpm install` to install dependencies.
Press `Ctrl+C` to stop the server.
```

## Code Examples

### General Principles

1. **Complete but concise** - Show enough context without being verbose
2. **Runnable** - Examples should work if copied
3. **Relevant** - Focus on the concept being explained
4. **Commented** - Explain non-obvious parts

### TypeScript Examples

Always include type information when helpful:

```typescript
// ✅ Good - includes types and imports
import { Zero } from '@rocicorp/zero';
import type { Message } from './schema';

async function fetchMessages(roomId: string): Promise<Message[]> {
  const zero = new Zero({ /* config */ });
  return zero.query.message
    .where('roomId', '=', roomId)
    .run();
}

// ❌ Bad - no types, incomplete
function fetchMessages(roomId) {
  return zero.query.message.where('roomId', '=', roomId).run();
}
```

### Code Block Language Tags

Always specify the language for syntax highlighting:

````markdown
```typescript
// TypeScript code
```

```javascript
// JavaScript code
```

```bash
# Shell commands
```

```json
// JSON configuration
```

```yaml
# YAML configuration
```
````

### Inline vs. Block Code

**Inline code** for short references:

```markdown
Use the `createTableSchema()` function to define your schema.
```

**Code blocks** for multi-line examples:

````markdown
```typescript
const schema = createTableSchema({
  tableName: 'user',
  columns: { id: { type: 'string' } },
});
```
````

### Command Examples

Use comments to explain commands:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run in specific workspace
pnpm --filter docs dev
```

Show output when helpful:

```bash
$ pnpm build
> build
> turbo build

✓ Built successfully
```

## MDX Components

### Callouts

Use callouts to highlight important information:

```mdx
<Callout type="info">
  Zero automatically handles connection retries and offline sync.
</Callout>

<Callout type="warning">
  Changing the primary key of an existing table requires data migration.
</Callout>

<Callout type="error">
  Never commit `.env` files containing secrets to version control.
</Callout>

<Callout type="success">
  Your change source is now streaming updates in real-time!
</Callout>
```

### Cards

Use cards for organizing related links or options:

```mdx
<Cards>
  <Card 
    title="Quick Start" 
    href="/getting-started"
    description="Get up and running in 5 minutes"
  />
  <Card 
    title="Architecture" 
    href="/architecture"
    description="Understand the three-container design"
  />
</Cards>
```

### Tabs

Use tabs for alternative approaches or different languages:

```mdx
<Tabs items={['TypeScript', 'JavaScript']}>
  <Tab value="TypeScript">
    ```typescript
    const typed: string = "Hello";
    ```
  </Tab>
  <Tab value="JavaScript">
    ```javascript
    const untyped = "Hello";
    ```
  </Tab>
</Tabs>
```

### Steps

Use steps for sequential tutorials:

```mdx
<Steps>

### Install dependencies

```bash
pnpm install
```

### Configure environment

Create a `.env` file with your settings.

### Start the server

```bash
pnpm dev
```

</Steps>
```

## File Organization

### Frontmatter

Every MDX file must have frontmatter:

```yaml
---
title: Page Title                    # Required - used in navigation and SEO
description: Brief page description   # Required - used in search and previews
---
```

Optional frontmatter fields:

```yaml
---
title: Advanced Guide
description: Deep dive into advanced topics
icon: Rocket                         # Icon for navigation, must match a lucide-react named export
---
```

### File Naming

Use kebab-case for file names:

```
✅ getting-started.mdx
✅ custom-change-sources.mdx
✅ api-reference.mdx

❌ GettingStarted.mdx
❌ custom_change_sources.mdx
❌ API-Reference.mdx
```

### Directory Structure

Group related content in directories:

```
guides/
  ├── index.mdx              # Overview page
  ├── quick-start.mdx
  ├── advanced-topics.mdx
  └── troubleshooting.mdx
```

Each directory should have:
- `index.mdx` - Overview/landing page
- `meta.json` - Navigation configuration (optional)

## Common Patterns

### Documenting APIs

```markdown
## `functionName(parameter)`

Brief description of what the function does.

### Parameters

- `parameter` (type) - Description of the parameter

### Returns

`ReturnType` - Description of what's returned

### Example

```typescript
const result = functionName('value');
```

### See Also

- [Related function](./related.md)
```

### Documenting Configuration

```markdown
## Configuration Option

### `optionName`

- **Type**: `string | number`
- **Default**: `'default-value'`
- **Required**: Yes/No

Description of what the option does.

### Example

```yaml
optionName: value
```
```

### Documenting Errors

```markdown
## Error: ERROR_CODE

**Message**: "Error message text"

### Cause

What causes this error.

### Solution

How to fix it.

### Example

```typescript
try {
  // code that might fail
} catch (error) {
  // handle ERROR_CODE
}
```
```

## Checklist for New Pages

Before submitting documentation:

- [ ] Frontmatter is complete (title, description)
- [ ] Headings use proper hierarchy
- [ ] Code examples are tested and work
- [ ] Links are valid and use descriptive text
- [ ] Grammar and spelling are correct
- [ ] Formatting is consistent with style guide
- [ ] Custom components are used appropriately
- [ ] File name uses kebab-case
- [ ] Content is concise and clear

## Questions?

If you're unsure about style decisions:

1. Check similar existing documentation
2. Ask in your pull request
3. Refer to [Fumadocs documentation](https://fumadocs.vercel.app/)

Remember: Consistency matters, but clarity matters more. When in doubt, prioritize making content understandable over following rules strictly.
