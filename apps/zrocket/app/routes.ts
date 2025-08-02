import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    // Room type index routes (handle last visited or first available room)
    route('d', 'routes/d/index.tsx'),
    route('p', 'routes/p/index.tsx'),
    route('c', 'routes/c/index.tsx'),

    // Specific room routes
    route('d/:chatId', 'routes/d/$chatId.tsx'),
    route('p/:groupId', 'routes/p/$groupId.tsx'),
    route('c/:channelId', 'routes/c/$channelId.tsx'),

    // Legacy routes (for backward compatibility)
    route('chat/:chatId', 'routes/chat/index.tsx'),
    route('group/:groupId', 'routes/group/index.tsx'),
    route('channel/:channelId', 'routes/channel/index.tsx'),

    // User preferences and help
    route('preferences', 'pages/UserPreferencesPage.tsx'),
    route('help-support', 'pages/HelpSupportPage.tsx'),

    // ZRocket discriminated union demo
    route('messages', 'routes/messages/index.tsx'),

    // ZRocket discriminated union demo
    route('info', 'routes/zrocket.tsx')

    //
] satisfies RouteConfig;
