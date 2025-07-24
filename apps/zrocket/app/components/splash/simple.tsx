import { useEffect, useState } from 'react';

const loadingSteps = [
    {
        caption: 'Initializing quantum flux capacitor...',
        svg: (
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-400"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-400"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-pink-400"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="3"
                    fill="currentColor"
                    className="text-yellow-400 animate-pulse"
                />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <line
                        key={i}
                        x1={50 + 35 * Math.cos((angle * Math.PI) / 180)}
                        y1={50 + 35 * Math.sin((angle * Math.PI) / 180)}
                        x2={50 + 42 * Math.cos((angle * Math.PI) / 180)}
                        y2={50 + 42 * Math.sin((angle * Math.PI) / 180)}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-400"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </svg>
        )
    },
    {
        caption: 'Reticulating splines...',
        svg: (
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <path
                    d="M10 50 Q30 20 50 50 T90 50"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-green-400"
                />
                <path
                    d="M10 30 Q30 60 50 30 T90 30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-blue-400"
                />
                <path
                    d="M10 70 Q30 40 50 70 T90 70"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-purple-400"
                />
                {[20, 40, 60, 80].map((x, i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={50 + Math.sin(x * 0.1) * 10}
                        r="2"
                        fill="currentColor"
                        className="text-yellow-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </svg>
        )
    },
    {
        caption: 'Herding digital cats...',
        svg: (
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                {/* Cat 1 */}
                <g className="animate-bounce" style={{ animationDelay: '0s' }}>
                    <ellipse
                        cx="25"
                        cy="60"
                        rx="8"
                        ry="6"
                        fill="currentColor"
                        className="text-orange-400"
                    />
                    <circle
                        cx="25"
                        cy="50"
                        r="6"
                        fill="currentColor"
                        className="text-orange-400"
                    />
                    <polygon
                        points="20,45 22,40 25,45"
                        fill="currentColor"
                        className="text-orange-400"
                    />
                    <polygon
                        points="25,45 28,40 30,45"
                        fill="currentColor"
                        className="text-orange-400"
                    />
                    <circle
                        cx="23"
                        cy="48"
                        r="1"
                        fill="currentColor"
                        className="text-gray-800"
                    />
                    <circle
                        cx="27"
                        cy="48"
                        r="1"
                        fill="currentColor"
                        className="text-gray-800"
                    />
                </g>
                {/* Cat 2 */}
                <g
                    className="animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                >
                    <ellipse
                        cx="50"
                        cy="70"
                        rx="8"
                        ry="6"
                        fill="currentColor"
                        className="text-gray-400"
                    />
                    <circle
                        cx="50"
                        cy="60"
                        r="6"
                        fill="currentColor"
                        className="text-gray-400"
                    />
                    <polygon
                        points="45,55 47,50 50,55"
                        fill="currentColor"
                        className="text-gray-400"
                    />
                    <polygon
                        points="50,55 53,50 55,55"
                        fill="currentColor"
                        className="text-gray-400"
                    />
                    <circle
                        cx="48"
                        cy="58"
                        r="1"
                        fill="currentColor"
                        className="text-gray-800"
                    />
                    <circle
                        cx="52"
                        cy="58"
                        r="1"
                        fill="currentColor"
                        className="text-gray-800"
                    />
                </g>
                {/* Cat 3 */}
                <g
                    className="animate-bounce"
                    style={{ animationDelay: '0.6s' }}
                >
                    <ellipse
                        cx="75"
                        cy="55"
                        rx="8"
                        ry="6"
                        fill="currentColor"
                        className="text-indigo-400"
                    />
                    <circle
                        cx="75"
                        cy="45"
                        r="6"
                        fill="currentColor"
                        className="text-indigo-400"
                    />
                    <polygon
                        points="70,40 72,35 75,40"
                        fill="currentColor"
                        className="text-indigo-400"
                    />
                    <polygon
                        points="75,40 78,35 80,40"
                        fill="currentColor"
                        className="text-indigo-400"
                    />
                    <circle
                        cx="73"
                        cy="43"
                        r="1"
                        fill="currentColor"
                        className="text-gray-800"
                    />
                    <circle
                        cx="77"
                        cy="43"
                        r="1"
                        fill="currentColor"
                        className="text-gray-800"
                    />
                </g>
            </svg>
        )
    },
    {
        caption: 'Optimizing bit patterns...',
        svg: (
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                {Array.from({ length: 8 }, (_, row) =>
                    Array.from({ length: 8 }, (_, col) => (
                        <rect
                            key={`${row}-${col}`}
                            x={col * 10 + 10}
                            y={row * 10 + 10}
                            width="8"
                            height="8"
                            fill="currentColor"
                            className={`${Math.random() > 0.5 ? 'text-blue-400' : 'text-gray-300'} animate-pulse`}
                            style={{ animationDelay: `${(row + col) * 0.05}s` }}
                        />
                    ))
                )}
            </svg>
        )
    },
    {
        caption: 'Calibrating reality matrix...',
        svg: (
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <defs>
                    <pattern
                        id="grid"
                        width="10"
                        height="10"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 10 0 L 0 0 0 10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            className="text-blue-300"
                        />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                <circle
                    cx="50"
                    cy="50"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-400 animate-ping"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-yellow-400 animate-pulse"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="2"
                    fill="currentColor"
                    className="text-red-400"
                />
            </svg>
        )
    },
    {
        caption: 'Almost there! Polishing the final touches...',
        svg: (
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                <path
                    d="M20 80 Q50 20 80 80"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-green-400"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-400"
                />
                <polygon
                    points="50,35 55,45 45,45"
                    fill="currentColor"
                    className="text-yellow-400"
                />
                {[0, 1, 2, 3, 4].map(i => (
                    <circle
                        key={i}
                        cx={30 + i * 10}
                        cy={80 - Math.abs(i - 2) * 5}
                        r="2"
                        fill="currentColor"
                        className="text-purple-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </svg>
        )
    }
];

export function SimpleSplash() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);

            setTimeout(() => {
                setCurrentStep(prev => (prev + 1) % loadingSteps.length);
                setIsVisible(true);
            }, 300);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const currentLoadingStep = loadingSteps[currentStep];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
            <div className="text-center space-y-8">
                {/* Animated SVG */}
                <div
                    className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="flex justify-center text-gray-600 dark:text-gray-300">
                        {currentLoadingStep.svg}
                    </div>
                </div>

                {/* App title */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ZRocket
                    </h1>
                </div>

                {/* Funny loading caption */}
                <div
                    className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium min-h-[1.5rem]">
                        {currentLoadingStep.caption}
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center space-x-2">
                    {loadingSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                index === currentStep
                                    ? 'bg-indigo-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
