import Hero from '../hero';

export function Welcome() {
    return (
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <div className="max-w-2xl w-full space-y-6 px-4">
                    <nav className="p-6 dark:border-gray-700 space-y-4">
                        <Hero />

                        {/* <p className="leading-6 text-gray-700 dark:text-gray-200 text-left font-bold">
                            Your rooms:
                        </p>
                        <ul>
                            {rooms.map(({ _id: id, name, usernames }) => (
                                <li key={id}>
                                    <a
                                        className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                                        href={`r/${id}`}
                                    >
                                        <span className="flex-1">{name}</span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {usernames?.join(', ')}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul> */}
                    </nav>
                </div>
            </div>
        </main>
    );
}
