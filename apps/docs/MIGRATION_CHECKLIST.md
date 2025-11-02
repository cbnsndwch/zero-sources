# Content Migration Checklist

This checklist helps ensure consistent, complete content migration to the Fumadocs documentation site.

## Pre-Migration

### Planning

- [ ] Identify source content (README.md, existing docs, etc.)
- [ ] Determine target location in information architecture
- [ ] Review content for accuracy and relevance
- [ ] Identify gaps in existing content
- [ ] Plan any new content needed

### Preparation

- [ ] Review information architecture documentation
- [ ] Select appropriate content template
- [ ] Gather code examples and verify they work
- [ ] Prepare images and diagrams
- [ ] Review frontmatter requirements

## Per-Library/Module Migration

### Directory Setup

- [ ] Create directory in appropriate section
  - Location: `apps/docs/content/[section]/[name]/`
- [ ] Create `meta.json` file
  - Define title, description, icon
  - List all pages in order
- [ ] Create `index.mdx` (overview page)

### Content Migration

#### Index Page (Overview)

- [ ] Copy and adapt README.md content
- [ ] Add proper frontmatter
  - `title`: Library/module name
  - `description`: Brief description (150-160 chars)
  - `icon`: Appropriate icon (optional)
- [ ] Add "Overview" section
- [ ] Add "Key Features" section with bullet points
- [ ] Add "Installation" section
- [ ] Add "Quick Start" section with code example
- [ ] Add "Next Steps" section with links

#### Installation Page

- [ ] Create `installation.mdx`
- [ ] Add frontmatter
- [ ] Document installation via pnpm
- [ ] Document peer dependencies
- [ ] Add verification steps
- [ ] Include troubleshooting common install issues

#### Usage/Configuration Page

- [ ] Create `usage.mdx` or `configuration.mdx`
- [ ] Add frontmatter
- [ ] Document basic usage
- [ ] Provide configuration options
- [ ] Include multiple examples
- [ ] Show common patterns

#### Additional Pages (as needed)

- [ ] Create topic-specific pages
- [ ] Follow template structure
- [ ] Add comprehensive examples
- [ ] Link to related content

### Code Examples

- [ ] Extract code examples from source
- [ ] Verify all code examples compile
- [ ] Test that examples work
- [ ] Add syntax highlighting (```typescript, ```bash, etc.)
- [ ] Add comments to explain complex code
- [ ] Keep examples focused and minimal
- [ ] Show realistic use cases

### Markdown Conversion

- [ ] Convert Markdown to MDX format
- [ ] Fix heading hierarchy (start with H1)
- [ ] Convert code blocks to proper syntax
- [ ] Convert tables to Markdown tables
- [ ] Convert lists to proper format
- [ ] Update relative links

### Links

- [ ] Update internal links to new structure
  - From: `../../libs/zero-contracts/README.md`
  - To: `/packages/zero-contracts`
- [ ] Verify external links still work
- [ ] Add links to related content
- [ ] Add links in "Next Steps" section
- [ ] Test all links work correctly

### Navigation

- [ ] Update `meta.json` with all pages
- [ ] Verify page order makes sense
- [ ] Test navigation in local dev server
- [ ] Check mobile navigation

### Images and Assets

- [ ] Move images to `apps/docs/public/images/`
- [ ] Update image references
- [ ] Add alt text to all images
- [ ] Optimize image sizes
- [ ] Create diagrams for complex concepts

### API Reference (if applicable)

- [ ] Plan API documentation location
- [ ] Set up API doc generation (if using typedoc)
- [ ] Add link from main page to API docs
- [ ] Generate initial API docs

## Quality Assurance

### Content Review

- [ ] Read through all content
- [ ] Check for accuracy
- [ ] Verify code examples
- [ ] Test all commands
- [ ] Check grammar and spelling
- [ ] Ensure consistent terminology
- [ ] Verify tone and style

### Technical Review

- [ ] Verify technical accuracy
- [ ] Test all code examples in clean environment
- [ ] Verify installation instructions
- [ ] Check configuration examples
- [ ] Test troubleshooting solutions

### Link Validation

- [ ] Test all internal links
- [ ] Test all external links
- [ ] Verify anchor links work
- [ ] Check cross-references

### SEO Review

- [ ] Verify page titles are descriptive
- [ ] Check descriptions are 150-160 characters
- [ ] Ensure proper heading hierarchy
- [ ] Verify keywords are present
- [ ] Check that URLs are clean and descriptive

### Accessibility

- [ ] All images have alt text
- [ ] Proper heading hierarchy
- [ ] Links have descriptive text (no "click here")
- [ ] Code examples have language specified
- [ ] Tables have headers

### Responsive Design

- [ ] Test on mobile device
- [ ] Check navigation works on mobile
- [ ] Verify code blocks scroll properly
- [ ] Check tables are readable
- [ ] Test images scale correctly

## Post-Migration

### Verification

- [ ] Build site locally and test
- [ ] Run validation script (if available)
- [ ] Check browser console for errors
- [ ] Test search functionality
- [ ] Verify analytics tracking

### Git Operations

- [ ] Create feature branch
- [ ] Commit changes with descriptive message
- [ ] Push to remote repository
- [ ] Create pull request

### Pull Request

- [ ] Write clear PR description
- [ ] Reference related issues
- [ ] Request review from team members
- [ ] Address review feedback
- [ ] Verify CI/CD passes

### Documentation

- [ ] Update DOCUMENTATION_STATUS.md
- [ ] Mark content as migrated
- [ ] Note any issues or incomplete items
- [ ] Update version history

### Cleanup

- [ ] Remove old documentation (if applicable)
- [ ] Add redirects from old URLs
- [ ] Update links in other documentation
- [ ] Archive old content appropriately

## Section-Specific Checklists

### For Libraries

- [ ] Installation instructions
- [ ] Basic usage example
- [ ] Configuration options
- [ ] API reference link
- [ ] Common patterns
- [ ] Troubleshooting section

### For Guides

- [ ] Prerequisites clearly stated
- [ ] Step-by-step instructions
- [ ] Code examples for each step
- [ ] Verification steps
- [ ] Troubleshooting section
- [ ] Next steps

### For Architecture Docs

- [ ] Overview and goals
- [ ] Architecture diagram
- [ ] Component descriptions
- [ ] Data flow explanation
- [ ] Design decisions
- [ ] Trade-offs documented

### For Demos

- [ ] Demo overview and purpose
- [ ] Running instructions
- [ ] Architecture explanation
- [ ] Code highlights
- [ ] Deployment guide

## Validation Commands

Run these commands to validate migration:

```bash
# Build documentation site
cd apps/docs
pnpm build

# Run local dev server
pnpm dev

# Lint content (if linter available)
pnpm lint

# Check for broken links (if tool available)
pnpm check-links
```

## Common Issues and Solutions

### Issue: Build fails with MDX error

**Solution**: Check for invalid MDX syntax, ensure code blocks are properly closed

### Issue: Navigation doesn't show page

**Solution**: Verify `meta.json` includes page slug, check file name matches slug

### Issue: Images don't load

**Solution**: Verify images are in `public/` directory, check paths are correct

### Issue: Links are broken

**Solution**: Use absolute paths (`/section/page`) or correct relative paths

## Notes

- Mark items as you complete them
- Add notes for any deviations from standard process
- Document any issues encountered
- Keep checklist updated as process improves

## Template

Copy this checklist for each content migration:

```markdown
## Migration: [Library/Module Name]

**Date**: 2025-11-01
**Migrated By**: [Your Name]
**Source**: [Path to original content]
**Destination**: apps/docs/content/[section]/[name]/

### Status
- [ ] Pre-Migration Complete
- [ ] Content Migrated
- [ ] Quality Assurance Complete
- [ ] Pull Request Created
- [ ] Reviewed and Merged

### Notes
[Any special notes or issues encountered]
```

---

**Version**: 1.0
**Last Updated**: November 1, 2025
**Maintained By**: Documentation Team
