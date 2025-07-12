import { table, string, boolean, json, number } from '@rocicorp/zero';

// Room tables using discriminated union configs
export const chats = table('chats')
  .from(JSON.stringify({
    source: 'rooms',
    filter: { type: 'd', isArchived: false },
    projection: { _id: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
  }))
  .columns({
    id: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

export const groups = table('groups')
  .from(JSON.stringify({
    source: 'rooms',
    filter: { type: 'p', isArchived: false },
    projection: { _id: 1, name: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
  }))
  .columns({
    id: string(),
    name: string(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

export const channels = table('channels')
  .from(JSON.stringify({
    source: 'rooms',
    filter: { type: 'c', isArchived: false },
    projection: { _id: 1, name: 1, description: 1, participantIds: 1, createdAt: 1, lastMessageAt: 1 }
  }))
  .columns({
    id: string(),
    name: string(),
    description: string().optional(),
    participantIds: json<string[]>(),
    createdAt: string(),
    lastMessageAt: string()
  })
  .primaryKey('id');

// Message tables using discriminated union configs
export const textMessages = table('textMessages')
  .from(JSON.stringify({
    source: 'messages',
    filter: { type: 'text', isDeleted: false },
    projection: { _id: 1, roomId: 1, senderId: 1, content: 1, createdAt: 1 }
  }))
  .columns({
    id: string(),
    roomId: string(),
    senderId: string(),
    content: string(),
    createdAt: string()
  })
  .primaryKey('id');

export const imageMessages = table('imageMessages')
  .from(JSON.stringify({
    source: 'messages',
    filter: { type: 'image', isDeleted: false },
    projection: { _id: 1, roomId: 1, senderId: 1, imageUrl: 1, caption: 1, imageMetadata: 1, createdAt: 1 }
  }))
  .columns({
    id: string(),
    roomId: string(),
    senderId: string(),
    imageUrl: string(),
    caption: string().optional(),
    imageMetadata: json<{
      width: number;
      height: number;
      fileSize: number;
      mimeType: string;
    }>(),
    createdAt: string()
  })
  .primaryKey('id');

export const systemMessages = table('systemMessages')
  .from(JSON.stringify({
    source: 'messages',
    filter: { type: 'system' },
    projection: { _id: 1, roomId: 1, action: 1, targetUserId: 1, createdAt: 1, metadata: 1 }
  }))
  .columns({
    id: string(),
    roomId: string(),
    action: string(),
    targetUserId: string().optional(),
    createdAt: string(),
    metadata: json<any>().optional()
  })
  .primaryKey('id');

// Participant tables using discriminated union configs
export const userParticipants = table('userParticipants')
  .from(JSON.stringify({
    source: 'participants',
    filter: { type: 'user' },
    projection: { _id: 1, userId: 1, roomId: 1, role: 1, joinedAt: 1, lastReadAt: 1, 'notificationSettings.muted': 1 }
  }))
  .columns({
    id: string(),
    userId: string(),
    roomId: string(),
    role: string(),
    joinedAt: string(),
    lastReadAt: string(),
    muted: boolean().optional()
  })
  .primaryKey('id');

export const botParticipants = table('botParticipants')
  .from(JSON.stringify({
    source: 'participants',
    filter: { type: 'bot' },
    projection: { _id: 1, botId: 1, roomId: 1, role: 1, joinedAt: 1, config: 1 }
  }))
  .columns({
    id: string(),
    botId: string(),
    roomId: string(),
    role: string(),
    joinedAt: string(),
    config: json<any>()
  })
  .primaryKey('id');