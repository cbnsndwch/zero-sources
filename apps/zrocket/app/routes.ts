import {
    type RouteConfig,
    index,
    layout,
    route
} from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    layout('components/layout/index.tsx', [
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
        ])
    ]),

    // Direct Messages

    // User preferences and help
    route('files', 'routes/files/index.tsx'),
    route('preferences', 'routes/preferences/index.tsx'),
    route('support', 'routes/support/index.tsx'),

    // ZRocket discriminated union demo
    route('messages', 'routes/messages/index.tsx'),

    // ZRocket info
    route('info', 'routes/zrocket.tsx')
] satisfies RouteConfig;

// <ZeroProvider zero={zero}>
//     <SidebarLayout />
// </ZeroProvider>
