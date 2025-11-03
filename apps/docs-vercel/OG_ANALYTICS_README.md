# OG Image Generation & Analytics Setup

This documentation app includes Open Graph image generation and Vercel Analytics integration.

## Features

### 1. Dynamic OG Image Generation

- **Route**: `/og`
- **Usage**: Dynamic Open Graph images generated on-demand using Satori
- **Parameters**:
  - `title` - The main title text
  - `description` - Optional description text
  - `path` - Optional path to display

Example:
```
/og?title=Getting%20Started&description=Learn%20how%20to%20use%20Zero%20Sources&path=/docs/getting-started
```

### 2. Analytics Integration

The app includes:
- **Vercel Analytics** - Track page views and user interactions
- **Vercel Speed Insights** - Monitor Core Web Vitals and performance

Both are automatically enabled in production on Vercel.

## Environment Variables

For proper OG image URL generation, set in your Vercel project:

```env
VERCEL_URL=your-domain.vercel.app
```

This is automatically set by Vercel during deployment.

## Meta Tags

All pages include:
- Open Graph tags for social sharing
- Twitter Card tags
- SEO-optimized metadata
- Canonical URLs

The `createMetaTags` helper in `app/lib/meta.ts` provides consistent meta tags across all pages.

## Usage in Routes

```tsx
import { createMetaTags } from '@/app/lib/meta';
import type { Route } from './+types/your-route';

export function meta({ location }: Route.MetaArgs) {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://zero-sources.vercel.app';

  return createMetaTags({
    title: 'Your Page Title',
    description: 'Your page description',
    path: location.pathname,
    type: 'article' // or 'website'
  }, baseUrl);
}
```

## Testing OG Images Locally

1. Run the dev server: `pnpm dev`
2. Visit: `http://localhost:5173/og?title=Test`
3. Use tools like:
   - [OpenGraph.xyz](https://www.opengraph.xyz/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Customizing OG Images

Edit `app/lib/og-image.tsx` to customize:
- Layout and styling
- Font choices
- Brand colors
- Image dimensions

## Performance

- OG images are cached with `Cache-Control: public, max-age=31536000, immutable`
- Satori generates SVG, converted to PNG via resvg for optimal quality
- Images are 1200x630px (recommended by all social platforms)
