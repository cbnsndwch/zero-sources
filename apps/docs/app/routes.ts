import { type RouteConfig, index, layout } from '@react-router/dev/routes';

export default [
    layout('routes/_index.tsx', [index('routes/home.tsx')])
] satisfies RouteConfig;
