/* eslint-disable no-empty-pattern */
import type { Route } from '+routes/home/+types';

import { Welcome } from './components/welcome/welcome';

export function meta({}: Route.MetaArgs) {
    return [
        { title: 'ZChat ~ Zero Cache + Mongo' },
        { name: 'description', content: 'Turtles (objects) all the way down!' }
    ];
}

export default function Home() {
    return (
        <div className="relative h-full min-h-full w-full overflow-hidden bg-grid-white dark:bg-grid-small-white/[0.025]">
            <div className="relative mx-auto flex max-w-7xl flex-col">
                <Welcome />
            </div>
        </div>
    );
}
