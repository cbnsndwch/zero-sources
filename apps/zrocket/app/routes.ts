import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    // room details
    route('d/:chatId', 'routes/chat/index.tsx'),
    route('p/:groupId', 'routes/group/index.tsx'),
    route('c/:channelId', 'routes/channel/index.tsx'),

    // ZRocket discriminated union demo
    route('messages', 'routes/messages/index.tsx'),

    // ZRocket discriminated union demo
    route('info', 'routes/zrocket.tsx')

    //
] satisfies RouteConfig;
