# zero-sources Documentation

This is the documentation site for the zero-sources project, built with React Router v7, Vite, and Fumadocs.

## Development

Install dependencies from the monorepo root:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev --filter=docs
```

The site will be available at `http://localhost:5173`.

## Build

Build the production site:

```bash
pnpm build --filter=docs
```

## Technology Stack

- **React Router v7**: File-based routing with SSR support
- **Vite 6**: Fast build tool with HMR
- **Fumadocs 16**: Documentation framework with React Router support
- **Tailwind CSS 4**: Utility-first CSS framework
- **TypeScript 5.9**: Type-safe development

## Project Structure

```
apps/docs/
├── app/                    # Application code
│   ├── routes/            # Route components
│   ├── root.tsx           # Root layout
│   └── globals.css        # Global styles
├── content/               # MDX documentation content
├── components/            # Reusable React components
├── public/                # Static assets
├── vite.config.ts         # Vite configuration
└── react-router.config.ts # React Router configuration
```

## Environment Variables

Create a `.env` file in the `apps/docs` directory based on `.env.example`:

```bash
cp .env.example .env
```

### Required Variables

- **`VITE_CLARITY_PROJECT_ID`**: Microsoft Clarity project ID for analytics (optional)

#### Server-Side Variables (Feedback Integration)

**IMPORTANT**: These variables do NOT have the `VITE_` prefix, which keeps them server-side only and prevents exposure in the client bundle.

##### GitHub Integration

- **`GITHUB_TOKEN`**: GitHub personal access token for feedback integration (required)
  - Create at: <https://github.com/settings/tokens>
  - Required scopes: `repo` (for creating issues)
  - Alternative: Use GitHub App token for better security
- **`GITHUB_REPO_OWNER`**: GitHub repository owner (default: `cbnsndwch`)
- **`GITHUB_REPO_NAME`**: GitHub repository name (default: `zero-sources`)

##### NocoDB Integration

- **`NOCODB_URL`**: Your NocoDB instance URL (required)
  - Example: `https://your-nocodb-instance.com`
- **`NOCODB_TOKEN`**: NocoDB API token (required)
  - Create in NocoDB: Settings → API Tokens

### Feedback Integration

The documentation site includes a privacy-focused feedback system:

#### User Privacy

- Users provide their **name and email** when submitting feedback
- Contact information is **NOT made public** and stored securely in NocoDB
- Feedback is posted to GitHub with an **anonymized display name** (e.g., "HelpfulContributor1234")
- Same user always gets the same display name for consistency
- Users can optionally create GitHub issues directly themselves

#### How It Works

1. User submits feedback with name, email, and message
2. System checks NocoDB for existing user by email
3. If new user, generates unique anonymized display name
4. Stores full feedback record (including real contact info) in NocoDB
5. Creates GitHub issue attributed to anonymized display name
6. Returns GitHub issue link to user

#### GitHub Issues

- **Positive feedback** labeled with `feedback-good`
- **Negative feedback** labeled with `feedback-bad`
- All feedback labeled with `documentation` and `user-feedback`
- Issue body shows anonymized display name, not real identity

#### NocoDB Schema

Required tables in your NocoDB instance:

**`feedback_users` table:**

- `Id` (Auto Number, Primary Key)
- `email` (Single Line Text, Unique)
- `name` (Single Line Text)
- `display_name` (Single Line Text, Unique)
- `created_at` (DateTime, Auto-fill)

**`feedback_submissions` table:**

- `Id` (Auto Number, Primary Key)
- `user_id` (Number, Links to feedback_users.Id)
- `display_name` (Single Line Text)
- `url` (Single Line Text)
- `opinion` (Single Select: good, bad)
- `message` (Long Text)
- `github_issue_url` (URL)
- `github_issue_number` (Number)
- `created_at` (DateTime, Auto-fill)

**Security Note**: Never commit your `.env` file or tokens to the repository. All secrets should be stored securely in environment variables in production.

## Next Steps

1. Add documentation content to `content/` directory
2. Configure theme and navigation in `app/root.tsx`
3. Set up search functionality
4. Deploy to production

For more details, see the [PRD](../../docs/projects/fumadocs-with-react-router/PRD.md) and [implementation stories](../../docs/projects/fumadocs-with-react-router/implementation-plan/).
