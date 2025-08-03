import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    // Direct Messages
    route('d', 'routes/direct/layout.tsx', [
        index('routes/direct/index.tsx'),
        route(':chatId', 'routes/direct/chat.tsx')
    ]),

    // Private Groups
    route('p', 'routes/groups/layout.tsx', [
        index('routes/groups/index.tsx'),
        route(':chatId', 'routes/groups/chat.tsx')
    ]),

    // Public Channels
    route('c', 'routes/channels/layout.tsx', [
        index('routes/channels/index.tsx'),
        route(':channelId', 'routes/channels/channel.tsx')
    ]),

    // User preferences and help
    route('files', 'routes/files.tsx'),
    route('preferences', 'routes/preferences/layout.tsx', [
        index('routes/preferences/index.tsx'),
        route('notifications', 'routes/preferences/notifications.tsx'),
        route('advanced', 'routes/preferences/advanced.tsx')
    ]),
    route('help-support', 'routes/help-support/layout.tsx', [
        index('routes/help-support/index.tsx'),
        route('contact', 'routes/help-support/contact.tsx')
    ]),

    // ZRocket discriminated union demo
    route('messages', 'routes/messages/index.tsx'),

    // ZRocket info
    route('info', 'routes/zrocket.tsx')
] satisfies RouteConfig;
