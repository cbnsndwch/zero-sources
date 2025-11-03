# Feedback Feature

This feature module handles user feedback submissions for the Zero Sources documentation site.

## Overview

The feedback system:

- Collects user feedback about documentation pages
- Anonymizes user identities with generated display names
- Creates GitHub issues for tracking feedback
- Stores feedback records in NocoDB with user relationships
- Integrates with the documentation site's React Router 7 frontend

## Architecture

### Components

```text
features/feedback/
├── controllers/          # HTTP controllers for API endpoints
│   └── feedback.controller.ts
├── services/            # Business logic for feedback processing
│   └── feedback.service.ts
├── dto/                 # Data Transfer Objects for validation
│   └── feedback.dto.ts
├── types/               # TypeScript type definitions
│   └── feedback.types.ts
└── feedback.module.ts   # NestJS module configuration
```

### Key Features

1. **User Anonymization**: Generates unique display names (e.g., "Helpful Developer abc12") to protect user privacy in public GitHub issues
2. **GitHub Integration**: Automatically creates issues with appropriate labels and formatting
3. **Database Storage**: Stores feedback with full user details in NocoDB for private follow-up
4. **Validation**: Uses class-validator decorators for input validation

## API Endpoints

### POST /api/feedback

Submit documentation feedback.

**Request Body:**

```typescript
{
  "name": string,       // User's name
  "email": string,      // User's email (validated)
  "url": string,        // Documentation page URL
  "opinion": "good" | "bad",  // Feedback sentiment
  "message": string     // Feedback message
}
```

**Response (201):**

```typescript
{
  "githubUrl": string,      // URL to created GitHub issue
  "issueNumber": number     // GitHub issue number
}
```

## Environment Variables

Required configuration in `.env`:

```bash
# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_REPO_OWNER=cbnsndwch
GITHUB_REPO_NAME=zero-sources

# NocoDB Configuration
DB_URL=https://your-nocodb-instance.com
DB_TOKEN=your_nocodb_token
BASE_ID=your_base_id
USER_TABLE_ID=your_user_table_id
FEEDBACK_TABLE_ID=your_feedback_table_id
```

## Usage

### From React Router 7 Frontend

The RR7 API route (`app/api/feedback.ts`) proxies requests to the NestJS backend:

```typescript
// Client-side form submission
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    url: 'https://docs.example.com/getting-started',
    opinion: 'good',
    message: 'Great documentation!'
  })
});

const result = await response.json();
console.log(`Issue created: ${result.githubUrl}`);
```

### Direct NestJS Usage

```typescript
import { FeedbackService } from './features/feedback';

@Injectable()
class SomeService {
  constructor(private feedbackService: FeedbackService) {}

  async handleFeedback() {
    const result = await this.feedbackService.submitFeedback({
      name: 'Jane Doe',
      email: 'jane@example.com',
      url: 'https://docs.example.com/api',
      opinion: 'bad',
      message: 'Needs more examples'
    });
  }
}
```

## Database Schema

### Users Table

- `email` (string, unique): User's email address
- `name` (string): User's real name
- `display_name` (string): Anonymized display name for public attribution

### Feedback Table

- `url` (string): Documentation page URL
- `opinion` (string): "good" or "bad"
- `message` (text): Feedback content
- `display_name` (string): Anonymized user display name
- `github_issue_url` (string): URL to created issue
- `github_issue_number` (number): GitHub issue number
- `User` (relation): Link to user record

## Testing

```bash
# Run unit tests
pnpm test

# Test the endpoint manually
curl -X POST http://localhost:3003/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "url": "https://docs.example.com/test",
    "opinion": "good",
    "message": "Test feedback"
  }'
```

## Security Considerations

1. **Email Privacy**: User emails are stored in NocoDB but never exposed in GitHub issues
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Input Validation**: All inputs are validated using class-validator
4. **Token Security**: GitHub and NocoDB tokens are server-side only (never exposed to frontend)

## Future Enhancements

- [ ] Add rate limiting per user/IP
- [ ] Email notifications for feedback responses
- [ ] Dashboard for viewing/managing feedback
- [ ] Sentiment analysis integration
- [ ] Auto-categorization of feedback
