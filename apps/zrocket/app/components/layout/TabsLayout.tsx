import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

type TabsLayoutProps = PropsWithChildren<{
    title: string;
    description?: string;
}>;

export default function TabsLayout({
    children,
    title,
    description
}: TabsLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{title}</h1>
                        {description ? (
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
