# Story 002: Theme and Branding Configuration

**Story ID**: FDS-STORY-002
**Epic**: [FDS-EPIC-001 - Initial Setup and Configuration](../epics/epic-001-initial-setup.md)
**Status**: Not Started
**Priority**: High
**Estimated Effort**: 1 day
**Sprint**: 1

---

## User Story

**As a** user visiting the zero-sources documentation
**I want** the documentation site to have consistent, professional branding
**So that** I can recognize it as part of the zero-sources ecosystem and have a pleasant reading experience

## Background/Context

After the basic Fumadocs project is set up, we need to customize the theme and branding to match the zero-sources identity. This includes colors, typography, logo, favicon, and dark/light mode configuration. The site should feel cohesive with the project while maintaining the excellent UX of Fumadocs.

## Acceptance Criteria

**Given** the Fumadocs project is set up (Story 001 complete)
**When** I configure the theme and branding
**Then** I should have:

- [ ] Custom color palette applied (primary, secondary, accent colors)
- [ ] zero-sources logo displayed in header
- [ ] Custom favicon configured
- [ ] Dark and light mode both properly themed
- [ ] Dark/light mode toggle works in header
- [ ] Typography customized for headings and body text
- [ ] Consistent spacing and layout
- [ ] Professional, clean design aesthetic
- [ ] Mobile-responsive design verified

## Definition of Done

- [ ] Color palette defined and applied
- [ ] Logo and favicon assets added to `public/` directory
- [ ] Theme configuration updated in `tailwind.config.ts`
- [ ] Layout component updated with branding
- [ ] Dark/light mode toggle functional
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Code review completed
- [ ] Design approved by stakeholders

## Technical Details

### Color Palette

Define brand colors (example - adjust based on actual branding):

```css
:root {
  /* Brand Colors */
  --brand-primary: #0070f3;
  --brand-secondary: #7928ca;
  --brand-accent: #ff0080;
  
  /* Semantic Colors */
  --color-success: #0070f0;
  --color-warning: #f5a623;
  --color-error: #ff0000;
  --color-info: #0070f3;
}

[data-theme='dark'] {
  /* Dark mode adjustments */
  --brand-primary: #3291ff;
  --brand-secondary: #8a3ffc;
  --brand-accent: #ff4da6;
}
```

### Files to Create/Modify

#### Update `apps/docs/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';
import { createPreset } from 'fumadocs-ui/tailwind-plugin';

const config: Config = {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  presets: [createPreset()],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
};

export default config;
```

#### Update `apps/docs/app/layout.tsx`

```typescript
import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: {
    default: 'zero-sources Documentation',
    template: '%s | zero-sources',
  },
  description: 'Utilities and custom change sources for Rocicorp Zero',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <RootProvider
          theme={{
            enabled: true,
            defaultTheme: 'system',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
```

#### Update `apps/docs/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Brand Colors */
  --brand-primary: 59 130 246; /* blue-500 */
  --brand-secondary: 139 92 246; /* violet-500 */
  --brand-accent: 236 72 153; /* pink-500 */
  
  /* Font Variables */
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
}

[data-theme='dark'] {
  /* Dark theme adjustments */
  --brand-primary: 96 165 250; /* blue-400 */
  --brand-secondary: 167 139 250; /* violet-400 */
  --brand-accent: 244 114 182; /* pink-400 */
}

@layer base {
  body {
    @apply font-sans antialiased;
  }
  
  code {
    @apply font-mono;
  }
}
```

#### Create `apps/docs/components/layout/navbar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { ThemeToggle } from 'fumadocs-ui/components/theme-toggle';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="zero-sources"
              width={32}
              height={32}
              className="h-6 w-6"
            />
            <span className="font-bold sm:inline-block">
              zero-sources
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <Link
              href="https://github.com/cbnsndwch/zero-sources"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
            >
              <span className="sr-only">GitHub</span>
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
```

### Assets Needed

Create or obtain these assets:

- `apps/docs/public/logo.svg` - Main logo (SVG format)
- `apps/docs/public/favicon.ico` - Favicon (32x32 ICO)
- `apps/docs/public/favicon-16x16.png` - Small favicon
- `apps/docs/public/favicon-32x32.png` - Standard favicon
- `apps/docs/public/apple-touch-icon.png` - iOS icon (180x180)

## Testing Requirements

### Visual Testing

1. **Light Mode Test**:
   - Start dev server
   - Verify colors match brand palette
   - Check logo visibility
   - Verify text readability

2. **Dark Mode Test**:
   - Toggle to dark mode
   - Verify colors adjusted appropriately
   - Check logo visibility
   - Verify text readability
   - Toggle back to light mode

3. **Responsive Test**:
   - Test on mobile (< 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (> 1024px)
   - Verify logo scales appropriately
   - Verify navigation works on all sizes

4. **Browser Compatibility**:
   - Test on Chrome
   - Test on Firefox
   - Test on Safari
   - Test on Edge

### Verification Checklist

- [ ] Logo displays correctly in header
- [ ] Favicon shows in browser tab
- [ ] Colors match brand palette
- [ ] Dark mode toggle works smoothly
- [ ] Light mode is readable and professional
- [ ] Dark mode is readable and professional
- [ ] Typography is clear and consistent
- [ ] Mobile layout is usable
- [ ] No layout shift on theme toggle
- [ ] GitHub link works and opens in new tab

## Notes

- If brand assets don't exist, create simple placeholder versions
- Ensure sufficient color contrast for accessibility (WCAG AA)
- Keep design clean and focused on content
- Test theme toggle persistence (should remember user preference)
- Consider adding a custom color for code syntax highlighting

## Dependencies

### Blocks

- Story 001 (Project Setup) must be complete

### Blocked By

- None

## Related Documentation

- [Fumadocs Theming Guide](https://fumadocs.vercel.app/docs/ui/theme)
- [Tailwind CSS Customization](https://tailwindcss.com/docs/configuration)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

---

**Created**: November 1, 2025
**Last Updated**: November 1, 2025
**Story Owner**: Developer
