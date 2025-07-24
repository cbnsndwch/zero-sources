import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
    ReticulatingSplines,
    LoadingPolygons,
    ProcessingTextures,
    CompilingShaders,
    InitializingWorldPhysics,
    GeneratingTerrain
} from './AnimatedSVGs';

const loadingSequences = [
    {
        component: ReticulatingSplines,
        message: 'Whispering to the machines...'
    },
    {
        component: LoadingPolygons,
        message: 'Debugging rubber ducks...'
    },
    {
        component: ProcessingTextures,
        message: 'Reticulating splines...'
    },
    {
        component: CompilingShaders,
        message: 'Calculating butterfly effects...'
    },
    {
        component: InitializingWorldPhysics,
        message: 'Herding binary cats...'
    },
    {
        component: GeneratingTerrain,
        message: 'Asking about life, the universe, and everything...'
    }
];

const extraMessages = [
    'Transmogrifying the schema...',
    'Externalizing the central finite curve...',
    'Calibrating flux capacitor...',
    'Downloading more RAM...',
    'Reversing the polarity...',
    'Adjusting the space-time continuum...',
    'Feeding the hamsters...',
    'Waking up the server hamsters...',
    'Optimizing for maximum coolness...',
    'Loading pixel dust...',
    'Brewing coffee for the developers...',
    'Summoning the code wizards...',
    'Defragmenting the matrix...',
    'Untangling Christmas lights...',
    'Counting backwards from infinity...',
    'Dividing by zero (safely)...',
    'Initializing the flux inhibitor...',
    'Deploying additional vespene gas...',
    'Spinning up the primary core...',
    'Configuring quantum tunnels...',
    'Loading nostalgia protocols...',
    'Establishing uplink to mothership...'
];

interface SplashScreenProps {
    shouldShow: boolean;
    minDisplayTime?: number;
    onComplete?: () => void;
}

export default function SplashScreen({
    shouldShow,
    minDisplayTime = 1_000,
    onComplete
}: SplashScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        let animationStartTime = Date.now();

        const checkInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const animationElapsed = Date.now() - animationStartTime;

            // Check if we should advance to next animation (every 1.5s)
            if (animationElapsed >= 2_000) {
                setCurrentIndex(prev => {
                    if (prev < loadingSequences.length - 1) {
                        animationStartTime = Date.now();
                        return prev + 1;
                    } else {
                        // Continue with extra messages if we're still within minDisplayTime or shouldShow is true
                        if (shouldShow || elapsed < minDisplayTime) {
                            animationStartTime = Date.now();
                            return (
                                loadingSequences.length +
                                Math.floor(Math.random() * extraMessages.length)
                            );
                        } else {
                            setIsComplete(true);
                            return prev;
                        }
                    }
                });
            }
        }, 250);

        return () => clearInterval(checkInterval);
    }, [startTime, minDisplayTime, shouldShow]);

    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                onComplete?.();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isComplete, onComplete]);

    const currentMessage = useMemo(() => {
        if (currentIndex < loadingSequences.length) {
            return loadingSequences[currentIndex].message;
        } else {
            const extraIndex = currentIndex - loadingSequences.length;
            return extraMessages[extraIndex % extraMessages.length];
        }
    }, [currentIndex]);

    const CurrentSvg = useMemo(() => {
        if (currentIndex < loadingSequences.length) {
            return loadingSequences[currentIndex].component;
        } else {
            // Cycle through components for extra messages
            const componentIndex =
                (currentIndex - loadingSequences.length) %
                loadingSequences.length;
            return loadingSequences[componentIndex].component;
        }
    }, [currentIndex]);

    return (
        <motion.div
            className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex flex-col items-center gap-8 min-w-[400px] max-w-[500px] text-center px-8">
                <AnimatePresence mode="wait">
                    <CurrentSvg
                        key={currentIndex}
                        className="w-48 h-48 text-accent drop-shadow-2xl"
                    />
                </AnimatePresence>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={`message-${currentIndex}`}
                            className="text-2xl font-medium text-gray-100 tracking-wide"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            {currentMessage}
                        </motion.p>
                    </AnimatePresence>

                    <motion.div
                        className="flex gap-2 justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 bg-accent rounded-full shadow-lg"
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.4, 1, 0.4]
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: 'easeInOut'
                                }}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
