import { FilesTab } from './preferences/FilesTab';

import { UserPreferencesLayout } from '@/components/layout/UserPreferencesLayout';

const FilesPage = () => {
    return (
        <UserPreferencesLayout
            title="Files"
            description="Manage your downloads and file storage"
        >
            <FilesTab />
        </UserPreferencesLayout>
    );
};

export default FilesPage;
