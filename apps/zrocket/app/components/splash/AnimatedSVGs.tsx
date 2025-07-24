import { motion } from 'framer-motion';

import type { HasClassName } from '@cbnsndwch/zchat-contracts';
/**
 * Animated SVG: Reticulating Splines - Neural network with pulsing connections
 */
export function ReticulatingSplines({ className }: HasClassName) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
        >
            <defs>
                <radialGradient id="nodeGradient" cx="50%" cy="50%">
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="1"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0.3"
                    />
                </radialGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Neural network connections */}
            <motion.path
                d="M40,60 Q100,40 160,80"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                }}
                filter="url(#glow)"
            />
            <motion.path
                d="M60,120 Q100,100 140,140"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: 0.3
                }}
                filter="url(#glow)"
            />
            <motion.path
                d="M80,40 Q120,80 160,120"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: 0.6
                }}
                filter="url(#glow)"
            />
            <motion.path
                d="M40,100 Q80,140 120,100 Q160,60 180,100"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: 0.9
                }}
                filter="url(#glow)"
            />

            {/* Neural nodes */}
            {[
                { x: 40, y: 60, delay: 0 },
                { x: 80, y: 40, delay: 0.2 },
                { x: 120, y: 80, delay: 0.4 },
                { x: 160, y: 80, delay: 0.6 },
                { x: 60, y: 120, delay: 0.8 },
                { x: 100, y: 140, delay: 1.0 },
                { x: 140, y: 140, delay: 1.2 },
                { x: 40, y: 100, delay: 1.4 },
                { x: 180, y: 100, delay: 1.6 }
            ].map((node, i) => (
                <motion.circle
                    key={i}
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill="url(#nodeGradient)"
                    filter="url(#glow)"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: node.delay
                    }}
                />
            ))}

            {/* Central processing core */}
            <motion.circle
                cx="100"
                cy="100"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.8"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                filter="url(#glow)"
            />
            <motion.circle
                cx="100"
                cy="100"
                r="12"
                fill="currentColor"
                opacity="0.4"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.svg>
    );
}

/**
 * Animated SVG: Loading Polygons - Crystal formation with geometric growth
 */
export function LoadingPolygons({ className }: HasClassName) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
        >
            <defs>
                <linearGradient
                    id="crystalGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.8"
                    />
                    <stop
                        offset="50%"
                        stopColor="currentColor"
                        stopOpacity="0.4"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0.1"
                    />
                </linearGradient>
                <filter id="crystalGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Central crystal */}
            <motion.polygon
                points="100,40 130,70 130,130 100,160 70,130 70,70"
                fill="url(#crystalGradient)"
                stroke="currentColor"
                strokeWidth="2"
                filter="url(#crystalGlow)"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />

            {/* Orbiting crystals */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.g
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                >
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                        style={{ transformOrigin: '100px 100px' }}
                    >
                        <motion.polygon
                            points={`${
                                100 + 50 * Math.cos((angle * Math.PI) / 180)
                            },${100 + 50 * Math.sin((angle * Math.PI) / 180)} 
                      ${100 + 60 * Math.cos(((angle + 15) * Math.PI) / 180)},${
                          100 + 60 * Math.sin(((angle + 15) * Math.PI) / 180)
                      } 
                      ${100 + 50 * Math.cos(((angle + 30) * Math.PI) / 180)},${
                          100 + 50 * Math.sin(((angle + 30) * Math.PI) / 180)
                      } 
                      ${100 + 40 * Math.cos(((angle + 15) * Math.PI) / 180)},${
                          100 + 40 * Math.sin(((angle + 15) * Math.PI) / 180)
                      }`}
                            fill="currentColor"
                            opacity="0.6"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                            filter="url(#crystalGlow)"
                        />
                    </motion.g>
                </motion.g>
            ))}

            {/* Energy rings */}
            <motion.circle
                cx="100"
                cy="100"
                r="75"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="5,5"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
            <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.2"
                strokeDasharray="3,7"
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
        </motion.svg>
    );
}

/**
 * Animated SVG: Processing Textures - Pixel shader grid with texture sampling
 */
export function ProcessingTextures({ className }: HasClassName) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
        >
            <defs>
                <pattern
                    id="texturePattern"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <rect
                        width="20"
                        height="20"
                        fill="currentColor"
                        opacity="0.1"
                    />
                    <rect
                        width="10"
                        height="10"
                        fill="currentColor"
                        opacity="0.3"
                    />
                    <rect
                        x="10"
                        y="10"
                        width="10"
                        height="10"
                        fill="currentColor"
                        opacity="0.3"
                    />
                </pattern>
                <filter id="textureGlow">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Texture sampling grid */}
            <motion.rect
                x="30"
                y="30"
                width="140"
                height="140"
                fill="url(#texturePattern)"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.7"
                filter="url(#textureGlow)"
                animate={{
                    scale: [1, 1.02, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Scanning lines */}
            <motion.line
                x1="30"
                y1="50"
                x2="170"
                y2="50"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.8"
                animate={{ y1: [50, 150], y2: [50, 150] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                filter="url(#textureGlow)"
            />
            <motion.line
                x1="50"
                y1="30"
                x2="50"
                y2="170"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.8"
                animate={{ x1: [50, 150], x2: [50, 150] }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5
                }}
                filter="url(#textureGlow)"
            />

            {/* Pixel sampling points */}
            {Array.from({ length: 25 }, (_, i) => {
                const row = Math.floor(i / 5);
                const col = i % 5;
                const x = 50 + col * 25;
                const y = 50 + row * 25;
                return (
                    <motion.circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="currentColor"
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: (row + col) * 0.1
                        }}
                    />
                );
            })}

            {/* Processing indicator */}
            <motion.rect
                x="85"
                y="85"
                width="30"
                height="30"
                fill="currentColor"
                opacity="0.5"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.9, 0.5]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                filter="url(#textureGlow)"
            />
        </motion.svg>
    );
}

/**
 * Animated SVG: Compiling Shaders - Code flowing through pipelines
 */
export function CompilingShaders({ className }: HasClassName) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
        >
            <defs>
                <linearGradient
                    id="pipelineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                >
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.1"
                    />
                    <stop
                        offset="50%"
                        stopColor="currentColor"
                        stopOpacity="0.8"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0.1"
                    />
                </linearGradient>
                <filter id="shaderGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Shader pipeline */}
            <motion.rect
                x="20"
                y="60"
                width="160"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                rx="10"
                opacity="0.6"
            />
            <motion.rect
                x="20"
                y="100"
                width="160"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                rx="10"
                opacity="0.6"
            />
            <motion.rect
                x="20"
                y="140"
                width="160"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                rx="10"
                opacity="0.6"
            />

            {/* Code blocks flowing through pipelines */}
            {[0, 1, 2].map(pipeline => (
                <motion.rect
                    key={pipeline}
                    x="25"
                    y={65 + pipeline * 40}
                    width="30"
                    height="10"
                    fill="url(#pipelineGradient)"
                    rx="5"
                    animate={{ x: [25, 145, 25] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: pipeline * 0.5
                    }}
                    filter="url(#shaderGlow)"
                />
            ))}

            {/* Vertex shader stage */}
            <motion.circle
                cx="60"
                cy="40"
                r="15"
                fill="currentColor"
                opacity="0.7"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                filter="url(#shaderGlow)"
            />
            <text
                x="60"
                y="45"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                opacity="0.9"
            >
                VS
            </text>

            {/* Fragment shader stage */}
            <motion.circle
                cx="140"
                cy="40"
                r="15"
                fill="currentColor"
                opacity="0.7"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                filter="url(#shaderGlow)"
            />
            <text
                x="140"
                y="45"
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                opacity="0.9"
            >
                FS
            </text>

            {/* GPU cores */}
            {Array.from({ length: 8 }, (_, i) => (
                <motion.rect
                    key={i}
                    x={40 + i * 15}
                    y="180"
                    width="8"
                    height="12"
                    fill="currentColor"
                    opacity="0.5"
                    animate={{
                        scaleY: [1, 2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1
                    }}
                />
            ))}
        </motion.svg>
    );
}

/**
 * Animated SVG: Initializing World Physics - Particle system with gravity wells
 */
export function InitializingWorldPhysics({ className }: HasClassName) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
        >
            <defs>
                <radialGradient id="gravityWell" cx="50%" cy="50%">
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="1"
                    />
                    <stop
                        offset="70%"
                        stopColor="currentColor"
                        stopOpacity="0.3"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                    />
                </radialGradient>
                <filter id="physicsGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Central gravity well */}
            <motion.circle
                cx="100"
                cy="100"
                r="40"
                fill="url(#gravityWell)"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Orbiting particles */}
            {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const radius = 60 + (i % 3) * 15;
                return (
                    <motion.g
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 8 + (i % 3) * 2,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                        style={{ transformOrigin: '100px 100px' }}
                    >
                        <motion.circle
                            cx={100 + radius * Math.cos(angle)}
                            cy={100 + radius * Math.sin(angle)}
                            r={3 + (i % 3)}
                            fill="currentColor"
                            opacity="0.8"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            filter="url(#physicsGlow)"
                        />
                    </motion.g>
                );
            })}

            {/* Physics field lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <motion.line
                    key={i}
                    x1={100 + 25 * Math.cos((angle * Math.PI) / 180)}
                    y1={100 + 25 * Math.sin((angle * Math.PI) / 180)}
                    x2={100 + 85 * Math.cos((angle * Math.PI) / 180)}
                    y2={100 + 85 * Math.sin((angle * Math.PI) / 180)}
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.4"
                    strokeDasharray="2,4"
                    animate={{
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.25
                    }}
                />
            ))}

            {/* Force indicators */}
            <motion.polygon
                points="100,30 105,40 95,40"
                fill="currentColor"
                opacity="0.6"
                animate={{ y: [30, 35, 30] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.polygon
                points="30,100 40,95 40,105"
                fill="currentColor"
                opacity="0.6"
                animate={{ x: [30, 35, 30] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.polygon
                points="100,170 95,160 105,160"
                fill="currentColor"
                opacity="0.6"
                animate={{ y: [170, 165, 170] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <motion.polygon
                points="170,100 160,105 160,95"
                fill="currentColor"
                opacity="0.6"
                animate={{ x: [170, 165, 170] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />
        </motion.svg>
    );
}

/**
 * Animated SVG: Generating Terrain - Heigh map with mountain formation
 */
export function GeneratingTerrain({ className }: HasClassName) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
        >
            <defs>
                <linearGradient
                    id="terrainGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                >
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.9"
                    />
                    <stop
                        offset="50%"
                        stopColor="currentColor"
                        stopOpacity="0.6"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0.2"
                    />
                </linearGradient>
                <filter id="terrainGlow">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Mountain ranges */}
            <motion.path
                d="M20,160 L40,120 L60,140 L80,90 L100,110 L120,60 L140,80 L160,100 L180,120 L200,140 L200,180 L20,180 Z"
                fill="url(#terrainGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, ease: 'easeOut' }}
                filter="url(#terrainGlow)"
            />

            {/* Secondary mountain layer */}
            <motion.path
                d="M20,140 L50,100 L70,120 L90,80 L110,100 L130,70 L150,90 L170,110 L200,130 L200,180 L20,180 Z"
                fill="currentColor"
                opacity="0.4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 3, ease: 'easeOut', delay: 0.5 }}
                filter="url(#terrainGlow)"
            />

            {/* Heightmap grid */}
            {Array.from({ length: 10 }, (_, i) => (
                <motion.line
                    key={`vertical-${i}`}
                    x1={20 + i * 18}
                    y1="60"
                    x2={20 + i * 18}
                    y2="180"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                />
            ))}

            {Array.from({ length: 8 }, (_, i) => (
                <motion.line
                    key={`horizontal-${i}`}
                    x1="20"
                    y1={60 + i * 15}
                    x2="200"
                    y2={60 + i * 15}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: i * 0.1 + 1, duration: 0.5 }}
                />
            ))}

            {/* Height sampling points */}
            {Array.from({ length: 15 }, (_, i) => {
                const x = 30 + i * 12;
                const heights = [
                    140, 120, 125, 95, 105, 70, 85, 90, 110, 100, 115, 105, 125,
                    130, 135
                ];
                const y = heights[i] || 140;
                return (
                    <motion.circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="2"
                        fill="currentColor"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 2 + i * 0.1, duration: 0.3 }}
                    />
                );
            })}

            {/* Terrain generation waves */}
            <motion.path
                d="M20,50 Q60,40 100,50 T180,50"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                animate={{
                    d: [
                        'M20,50 Q60,40 100,50 T180,50',
                        'M20,45 Q60,55 100,45 T180,55',
                        'M20,50 Q60,40 100,50 T180,50'
                    ]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
                filter="url(#terrainGlow)"
            />

            {/* Progress indicator */}
            <motion.rect
                x="20"
                y="30"
                width="0"
                height="4"
                fill="currentColor"
                animate={{ width: 160 }}
                transition={{ duration: 4, ease: 'easeOut' }}
            />
        </motion.svg>
    );
}
