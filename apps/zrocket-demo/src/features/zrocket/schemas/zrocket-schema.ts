import { createSchema, relationships, type Schema } from '@rocicorp/zero';

import {
  chats,
  groups,
  channels,
  textMessages,
  imageMessages,
  systemMessages,
  userParticipants,
  botParticipants
} from './zero-tables.js';

export const zrocketSchema: Schema = createSchema(1, {
  tables: [
    // Room tables
    chats,
    groups,
    channels,
    // Message tables
    textMessages,
    imageMessages,
    systemMessages,
    // Participant tables
    userParticipants,
    botParticipants
  ]
  // TODO: Add relationships once the basic schema works
});

export type ZRocketSchema = typeof zrocketSchema;