import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
    return [
        { title: 'ZRocket ~ Zero Cache + Mongo' },
        { name: 'description', content: 'Turtles (objects) all the way down!' }
    ];
}

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to general channel by default
        navigate('/c/general', { replace: true });
    }, [navigate]);

    return (
        <div className="relative h-full min-h-full w-full overflow-hidden bg-background">
            <div className="relative mx-auto flex max-w-7xl flex-col">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">
                            Loading ZRocket...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
