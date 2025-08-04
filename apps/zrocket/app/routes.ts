import {
    type RouteConfig,
    index,
    layout,
    route
} from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    layout('components/layout/index.tsx', [
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
        ])
    ]),

    // User preferences and help
    route('files', 'routes/files/index.tsx'),
    route('preferences', 'routes/preferences/index.tsx'),
    route('support', 'routes/support/index.tsx'),

    // demos
    route('demos/rich-message-editor', 'routes/demos/rich-editor-demo.tsx'),
    route('demos/copy-paste', 'routes/demos/copy-paste-demo.tsx')
] satisfies RouteConfig;
