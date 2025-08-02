import { useEffect, useState } from 'react';

export function SplashScreen() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev.length >= 3) return '';
                return prev + '.';
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center space-y-8">
                {/* Animated Logo/Icon */}
                <div className="relative">
                    <div className="w-20 h-20 mx-auto">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>

                        {/* Inner pulsing circle */}
                        <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Name/Title */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ZRocket
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                        Initializing{dots}
                    </p>
                </div>

                {/* Loading bar */}
                <div className="w-64 mx-auto">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Floating particles animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full opacity-20 animate-bounce"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + (i % 2) * 40}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: `${2 + i * 0.5}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
