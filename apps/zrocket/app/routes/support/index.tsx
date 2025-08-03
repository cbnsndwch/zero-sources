import { useSearchParams } from 'react-router';

import LearnTab from './learn';
import SupportTab from './support';

import TabsLayout from '@/components/layout/TabsLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HelpSupportLayout() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'learn';

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <TabsLayout
            title="Help & Support"
            description="Get help, learn about features, and contact support"
        >
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="learn" className="cursor-pointer">
                        Learn
                    </TabsTrigger>
                    <TabsTrigger value="support" className="cursor-pointer">
                        Support
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="learn">
                    <LearnTab />
                </TabsContent>

                <TabsContent value="support">
                    <SupportTab />
                </TabsContent>
            </Tabs>
        </TabsLayout>
    );
}
