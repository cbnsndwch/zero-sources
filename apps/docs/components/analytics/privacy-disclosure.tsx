import Link from 'fumadocs-core/link';
import { Info } from 'lucide-react';

/**
 * Privacy Disclosure Component
 *
 * Site disclosure for Microsoft Clarity and Vercel analytics.
 * Displays in the sidebar footer to inform users about data collection.
 *
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/privacy-disclosure
 */
export default function PrivacyDisclosure() {
    return (
        <div className="text-xs text-fd-muted-foreground p-2 border-t mt-2 grid grid-cols-[auto_1fr] gap-2">
            <Info className="size-3.5 mt-0.5 shrink-0" />
            <div className="space-y-2">
                <p className="leading-tight">
                    We improve our products by using{' '}
                    <span className="font-medium">Microsoft Clarity</span> and{' '}
                    <span className="font-medium">Vercel Analytics</span> to
                    understand how you use this website.
                </p>
                <p className="leading-tight">
                    By using this site, you agree that we, vercel, and Microsoft
                    can collect and use this data.{' '}
                    <Link
                        href="/docs/privacy"
                        className="text-fd-foreground underline hover:text-fd-primary"
                    >
                        Learn more
                    </Link>
                </p>
            </div>
        </div>
    );
}
