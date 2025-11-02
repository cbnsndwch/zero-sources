import clarity from '@microsoft/clarity';
import { useEffect } from 'react';

/**
 * Microsoft Clarity Analytics Component
 *
 * Initializes Microsoft Clarity for user behavior analytics.
 * Requires VITE_CLARITY_PROJECT_ID environment variable to be set.
 *
 * @see https://clarity.microsoft.com/
 */
export default function ClarityInit() {
    useEffect(() => {
        const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

        if (!projectId) {
            if (import.meta.env.DEV) {
                console.warn(
                    'Clarity: VITE_CLARITY_PROJECT_ID not set. Analytics disabled.'
                );
            }
            return;
        }

        // Initialize Clarity
        clarity.init(projectId);

        if (import.meta.env.DEV) {
            console.log('Clarity initialized with project:', projectId);
        }
    }, []);

    return null;
}
