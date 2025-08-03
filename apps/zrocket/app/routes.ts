import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    // Direct Messages
    route('d', 'routes/d/layout.tsx', [
        index('routes/d/index.tsx'),
        route(':chatId', 'routes/d/chat.tsx')
    ]),

    // Private Groups
    route('p', 'routes/private-groups/layout.tsx', [
        index('routes/private-groups/index.tsx'),
        route(':chatId', 'routes/private-groups/chat.tsx')
    ]),

    // Public Channels
    route('c', 'routes/c/layout.tsx', [
        index('routes/c/index.tsx'),
        route(':channelId', 'routes/c/channel.tsx')
    ]),

    // User preferences and help
    route('preferences', 'pages/UserPreferencesPage.tsx'),
    route('files', 'pages/FilesPage.tsx'),
    route('help-support', 'pages/HelpSupportPage.tsx'),

    // ZRocket discriminated union demo
    route('messages', 'routes/messages/index.tsx'),

    // ZRocket info
    route('info', 'routes/zrocket.tsx')
] satisfies RouteConfig;
