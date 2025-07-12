import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('routes/home/index.tsx'),

    // room details
    route('r/:roomId', 'routes/room/index.tsx'),

    // ZRocket discriminated union demo
    route('zrocket', 'routes/zrocket.tsx')

    //
] satisfies RouteConfig;
