import { Spacer } from '@/components/ui/spacer';
import { SidebarSeparator } from '@/components/ui/sidebar';

import AddWorkspaceButton from './AddWorkspaceButton';
import DemoPageLinks from './DemoPageLinks';
import UserMenu from './UserMenu';
import WorkspacesList from './WorkspacesList';

export default function WorkspaceSidebar() {
    return (
        <div className="w-12 flex flex-col items-center py-3 space-y-3">
            <WorkspacesList />

            <AddWorkspaceButton />

            <Spacer />

            <DemoPageLinks />

            <SidebarSeparator className="mb-6 mt-2" />

            <UserMenu />
        </div>
    );
}
