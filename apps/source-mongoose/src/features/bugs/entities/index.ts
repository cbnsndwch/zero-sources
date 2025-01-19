import type { ModelDefinition } from '@nestjs/mongoose';

import { Issue, IssueSchema } from './issue.entity.js';

export * from './issue.entity.js';

export const bugsEntities: ModelDefinition[] = [
    {
        name: Issue.name,
        schema: IssueSchema
    }
];
