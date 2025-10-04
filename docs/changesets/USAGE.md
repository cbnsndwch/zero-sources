# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and publishing of packages.

## How to add a changeset

When you make changes that should be released, you need to add a changeset:

```bash
pnpm changeset
```

This will:

1. Ask which packages have changed
2. Ask what type of change (major, minor, patch)
3. Ask for a summary of the changes
4. Create a changeset file in `.changeset/`

## Types of changes

- **Patch**: Bug fixes and small improvements
- **Minor**: New features that don't break existing functionality
- **Major**: Breaking changes

## Workflow

1. **During development**: Add changesets for any changes that should be released
2. **On PR merge**: The Release GitHub Action will create a "Release PR" that bumps versions and updates changelogs
3. **Merge the Release PR**: This will publish the packages to npm

## Commands

- `pnpm changeset` - Add a new changeset
- `pnpm changeset:version` - Bump versions and update changelogs (usually done by CI)
- `pnpm changeset:publish` - Publish packages to npm (usually done by CI)
- `pnpm changeset:status` - Check what changesets are ready to be released

## Empty changesets

If you make changes that don't require a version bump (like documentation updates), you can add an empty changeset:

```bash
pnpm changeset add --empty
```

## Configuration

Changesets configuration is in `.changeset/config.json`. Key settings:

- **changelog**: Uses GitHub integration to link to commits and PRs
- **access**: Set to "public" for npm publishing
- **baseBranch**: Set to "main"
- **ignore**: The root package is ignored since it's private
