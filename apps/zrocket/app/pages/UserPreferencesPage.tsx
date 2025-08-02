import { useSearchParams } from 'react-router';

import { ProfileTab } from './preferences/ProfileTab';
import { NotificationsTab } from './preferences/NotificationsTab';
import { PreferencesTab } from './preferences/PreferencesTab';

import { UserPreferencesLayout } from '@/components/layout/UserPreferencesLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserPreferencesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    return (
        <UserPreferencesLayout
            title="User Preferences"
            description="Manage your account settings and preferences"
        >
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-6"
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="notifications">
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileTab />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsTab />
                </TabsContent>

                <TabsContent value="preferences">
                    <PreferencesTab />
                </TabsContent>
            </Tabs>
        </UserPreferencesLayout>
    );
};

export default UserPreferencesPage;
