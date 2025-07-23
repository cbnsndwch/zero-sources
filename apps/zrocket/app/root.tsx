import {
    useCallback,
    useSyncExternalStore,
    type PropsWithChildren
} from 'react';
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Scripts,
    ScrollRestoration
} from 'react-router';
import { ZeroProvider } from '@rocicorp/zero/react';

import type { Route } from './+types/root';
import './app.css';

import { LoginProvider } from '@/auth/login.provider';

import SidebarLayout from '@/components/layout';
import { TooltipProvider } from '@/components/ui/tooltip';

import { zeroRef } from '@/zero/setup';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous'
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'
    }
];

export function Layout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    // const [contentReady, setContentReady] = useState(false);

    const zero = useSyncExternalStore(
        zeroRef.onChange,
        useCallback(() => zeroRef.current, []),
        () => null // getServerSnapshot: return null during SSR
    );

    if (!zero) {
        return <h1>Loading data...</h1>;
    }

    return (
        <LoginProvider>
            <ZeroProvider zero={zero}>
                <TooltipProvider>
                    <SidebarLayout />
                </TooltipProvider>
            </ZeroProvider>
        </LoginProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details =
            error.status === 404
                ? 'The requested page could not be found.'
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
