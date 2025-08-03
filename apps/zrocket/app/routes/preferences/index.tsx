import { useSearchParams } from 'react-router';

import TabsLayout from '@/components/layout/TabsLayout';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import ProfileTab from './profile';
import NotificationsTab from './notifications';
import AdvancedTab from './advanced';

export default function UserPreferencesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <TabsLayout
            title="User Preferences"
            description="Manage your account settings and preferences"
        >
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile" className="cursor-pointer">
                        Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                        className="cursor-pointer"
                    >
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="cursor-pointer">
                        Preferences
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileTab />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsTab />
                </TabsContent>

                <TabsContent value="preferences">
                    <AdvancedTab />
                </TabsContent>
            </Tabs>
        </TabsLayout>
    );
}
