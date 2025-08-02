import { useSearchParams } from 'react-router';

import { LearnTab } from './help-support/LearnTab';
import { SupportTab } from './help-support/SupportTab';

import { UserPreferencesLayout } from '@/components/layout/UserPreferencesLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HelpSupportPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'learn';

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <UserPreferencesLayout
            title="Help & Support"
            description="Get help, learn about features, and contact support"
        >
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="learn">Learn</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>

                <TabsContent value="learn">
                    <LearnTab />
                </TabsContent>

                <TabsContent value="support">
                    <SupportTab />
                </TabsContent>
            </Tabs>
        </UserPreferencesLayout>
    );
}
