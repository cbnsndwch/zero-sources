import { Spacer } from '@/components/ui/spacer';

import AddWorkspaceButton from './AddWorkspaceButton';
import UserMenu from './UserMenu';
import WorkspacesList from './WorkspacesList';

export default function WorkspaceSidebar() {
    return (
        <div className="w-12 flex flex-col items-center py-3 space-y-3">
            <WorkspacesList />

            <AddWorkspaceButton />

            <Spacer />

            <UserMenu />
        </div>
    );
}
