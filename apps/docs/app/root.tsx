import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { RootProvider } from 'fumadocs-ui/provider/react-router';
import './globals.css';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
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
                <RootProvider>{children}</RootProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function Root() {
    return <Outlet />;
}
