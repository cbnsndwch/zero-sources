import { useEffect } from 'react';

/**
 * Microsoft Clarity Analytics Component
 *
 * Initializes Microsoft Clarity for user behavior analytics.
 * Requires VITE_CLARITY_PROJECT_ID environment variable to be set.
 *
 * Privacy Disclosure: This component collects user behavior data.
 * A privacy disclosure is displayed in the sidebar footer and a full
 * privacy policy is available at /docs/privacy as required by Microsoft.
 *
 * @see https://clarity.microsoft.com/
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure
 */
export default function ClarityInit() {
    useEffect(() => {
        // Only run on the client side
        if (typeof window === 'undefined') {
            return;
        }

        const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

        if (!projectId) {
            if (import.meta.env.DEV) {
                console.warn(
                    'Clarity: VITE_CLARITY_PROJECT_ID not set. Analytics disabled.'
                );
            }
            return;
        }

        // Dynamically import Clarity only on the client
        import('@microsoft/clarity')
            .then(clarityModule => {
                const clarity = clarityModule.default;
                clarity.init(projectId);

                if (import.meta.env.DEV) {
                    console.log('Clarity initialized with project:', projectId);
                }
            })
            .catch(error => {
                console.error('Failed to load Clarity:', error);
            });
    }, []);

    return null;
}
