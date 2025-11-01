export function meta() {
    return [
        { title: 'zero-sources Documentation' },
        {
            name: 'description',
            content: 'Welcome to the zero-sources documentation site'
        }
    ];
}

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold">zero-sources Documentation</h1>
            <p className="mt-4 text-lg">
                Welcome to the documentation site for zero-sources
            </p>
        </main>
    );
}
