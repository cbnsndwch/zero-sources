import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

import type { Route } from './+types/index';

import SplashScreen from '@/components/splash';

import { useZeroRef } from '@/zero/setup';


export function meta({}: Route.MetaArgs) {
    return [
        { title: 'ZRocket ~ Zero Cache + Mongo' },
        { name: 'description', content: 'Turtles (objects) all the way down!' }
    ];
}

export default function Home() {
    const navigate = useNavigate();

    const hideSplash = useCallback(() => {
        // redirect to DMs by default when the zero instance is ready
        navigate('/d', { replace: true });
    }, [navigate]);

    const zero = useZeroRef();

    useEffect(() => {
        if (!zero) {
            return;
        }

        hideSplash();
    }, [zero, hideSplash]);

    return (
        <div
            id="home"
            className="relative h-full min-h-full w-full flex justify-center items-center overflow-hidden bg-background"
        >
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

            <AnimatePresence>
                <SplashScreen shouldShow={!zero} onComplete={hideSplash} />
            </AnimatePresence>
        </div>
    );
}
