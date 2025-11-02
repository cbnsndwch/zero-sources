# Privacy & Analytics Disclosure Implementation

**Date**: November 2, 2025  
**Purpose**: Comply with Microsoft Clarity privacy disclosure requirements and provide transparency about analytics services

## Summary

Added comprehensive privacy disclosures for Microsoft Clarity and Vercel Analytics to the documentation site, following Microsoft's guidelines at <https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure>

## Changes Made

### 1. Privacy Policy Page

**File**: `apps/docs/content/docs/privacy.mdx`

Created a comprehensive privacy disclosure page covering:

- Overview of data collection practices
- Microsoft Clarity behavioral analytics
- Vercel Analytics & Speed Insights
- User privacy rights and opt-out options
- Cookie usage information
- Data security measures
- Third-party service integrations
- Compliance information (GDPR, CCPA)

**Accessible at**: `/docs/privacy`

### 2. Sidebar Footer Disclosure

**File**: `apps/docs/components/analytics/privacy-disclosure.tsx`

Created a compact privacy disclosure component that displays in the sidebar footer with:

- Info icon for visibility
- Brief explanation of Microsoft Clarity and Vercel Analytics usage
- Link to full privacy policy page
- Consent statement

**Features**:

- Always visible in the documentation sidebar
- Unobtrusive design with muted colors
- Clear call-to-action to learn more

### 3. Enhanced Clarity Component Documentation

**File**: `apps/docs/components/analytics/clarity.tsx`

Updated component documentation to:

- Reference privacy disclosure requirements
- Link to Microsoft's privacy guidelines
- Note the presence of privacy disclosures

### 4. Layout Configuration Update

**File**: `apps/docs/app/lib/layout.shared.tsx`

Integrated the privacy disclosure into the base layout options:

- Added `PrivacyDisclosure` component to sidebar footer
- Updated type definitions for proper TypeScript support
- Ensures disclosure appears on all documentation pages

## Compliance

### Microsoft Clarity Requirements ✓

As per Microsoft's [privacy disclosure guidelines](https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure), the implementation includes:

1. **Site Disclosure** (Footer):
   - ✓ States that we use Microsoft Clarity
   - ✓ Explains data collection purpose
   - ✓ Links to privacy policy
   - ✓ Indicates user consent by using the site

2. **Privacy Policy Page**:
   - ✓ Details about Clarity technology
   - ✓ Specific data collection methods (heatmaps, session replay)
   - ✓ Purpose of data collection
   - ✓ Link to [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement)

### Vercel Analytics

Also included disclosure for:

- Vercel Analytics (privacy-friendly, no cookies)
- Vercel Speed Insights (performance monitoring)
- Links to [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

## User Rights

The privacy page provides information about:

- How to opt out of tracking
- Cookie management
- Browser privacy settings
- Do Not Track support
- Data retention policies

## Next Steps (Optional Enhancements)

1. **Cookie Consent Banner**: Consider adding an interactive consent banner for GDPR compliance
2. **Analytics Opt-Out**: Implement a user preference toggle to disable analytics
3. **Privacy Settings Page**: Add a dedicated settings page for user privacy controls
4. **Consent Management Platform**: Integrate with a CMP like OneTrust or Cookiebot for enterprise use

## Testing

To verify the implementation:

1. **Start the dev server**:

   ```bash
   cd apps/docs
   pnpm dev
   ```

2. **Check the sidebar footer**: The privacy disclosure should appear at the bottom of the sidebar
3. **Visit the privacy page**: Navigate to `/docs/privacy` to see the full policy
4. **Verify the link**: Click "Learn more" in the footer disclosure to navigate to the policy page

## References

- [Microsoft Clarity Privacy Disclosure](https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure)
- [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement)
- [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)
- [GDPR Compliance](https://gdpr.eu/)
- [CCPA Compliance](https://oag.ca.gov/privacy/ccpa)

## Files Modified/Created

```text
apps/docs/
├── content/docs/
│   └── privacy.mdx                              # NEW: Privacy policy page
├── components/analytics/
│   ├── clarity.tsx                              # MODIFIED: Enhanced docs
│   └── privacy-disclosure.tsx                   # NEW: Sidebar disclosure
└── app/lib/
    └── layout.shared.tsx                        # MODIFIED: Added footer
```

---

**Copyright © 2023-present cbnsndwch LLC**  
**License**: MIT
