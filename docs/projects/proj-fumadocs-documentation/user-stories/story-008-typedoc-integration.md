# Story 008: Configure API Extractor Integration

**Story ID**: FDS-STORY-008  
**Epic**: [FDS-EPIC-003 - API Documentation Generation](../epics/epic-003-api-documentation.md)  
**Status**: ✅ Complete  
**Priority**: High  
**Estimated Effort**: 1 day  
**Sprint**: 2

---

## User Story

**As a** developer maintaining the documentation  
**I want** API Extractor configured to automatically generate API documentation  
**So that** API references stay in sync with library code without manual updates

## Acceptance Criteria

- [x] API Extractor installed and configured
- [x] Configuration files created for each library
- [x] Output format compatible with Fumadocs
- [x] Build process integration complete
- [x] Test generation successful for one library
- [x] Documentation for maintainers written

## Definition of Done

- [x] API Extractor dependencies installed
- [x] Configuration files created
- [x] Turborepo integration working
- [x] Test generation successful
- [x] Build time acceptable (< 3 minutes)
- [x] Documentation committed

## Technical Details

### API Extractor Configuration

```json
// libs/zero-contracts/api-extractor.json
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
  "apiReport": {
    "enabled": true,
    "reportFolder": "<projectFolder>/etc/"
  },
  "docModel": {
    "enabled": true,
    "apiJsonFilePath": "<projectFolder>/temp/<unscopedPackageName>.api.json"
  },
  "dtsRollup": {
    "enabled": false
  },
  "messages": {
    "extractorMessageReporting": {
      "ae-missing-release-tag": { "logLevel": "none" },
      "ae-unresolved-link": { "logLevel": "none" }
    }
  }
}
```

### Turborepo Integration

```json
// turbo.json
{
  "tasks": {
    "build:api-docs": {
      "dependsOn": ["^build"],
      "outputs": ["apps/docs/content/api/**"]
    }
  }
}
```

## Implementation Notes

**Decision**: Switched from TypeDoc to Microsoft API Extractor due to pnpm workspace compatibility issues.

**Tools Used**:

- `@microsoft/api-extractor` v7.53.3
- `@microsoft/api-documenter` v7.27.3

**Key Fixes**:

- Added `"declarationMap": false` to `zero-source-mongodb` and `synced-queries` tsconfig.json to resolve sourcemap errors

**Output**: 354 markdown files + 21 API report files (.api.md, .api.json)

**Documentation**: See `docs/API_DOCUMENTATION_GUIDE.md` for maintainer guide

## Dependencies

- Story 001: Project Setup

---

**Story Owner**: Developer  
**Created**: November 1, 2025  
**Completed**: November 1, 2025
