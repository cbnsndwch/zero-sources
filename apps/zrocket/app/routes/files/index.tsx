import TabsLayout from '@/components/layout/TabsLayout';

import Statistics from './Statistics';

import StorageSettings from './StorageSettings';

export default function FilesPage() {
    return (
        <TabsLayout
            title="Files"
            description="Manage your downloads and file storage"
        >
            <div className="space-y-6">
                <Statistics />

                <StorageSettings />
            </div>
        </TabsLayout>
    );
}
