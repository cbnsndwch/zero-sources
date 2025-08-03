import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function WorkspacesList() {
    const [activeWorkspace, setActiveWorkspace] = useState('zero');

    // TODO: useQuery
    const workspaces = useMemo(
        () => [
            {
                id: 'zero',
                name: 'Zero Sync',
                avatar: 'ZS',
                img: '/avatars/zero-256.png',
                active: true
            },
            {
                id: 'mongo',
                name: 'MongoDB',
                avatar: 'MG',
                img: '/avatars/mongo.png'
            },
            {
                id: 'nest',
                name: 'NestJS',
                avatar: 'NJ',
                img: '/avatars/nest.png'
            },
            {
                id: 'rr7',
                name: 'React Router',
                avatar: 'RR',
                img: '/avatars/react-router.png'
            }
        ],
        []
    );

    return (
        <>
            {workspaces.map(workspace => {
                const isActive = activeWorkspace === workspace.id;
                return (
                    <Avatar
                        key={workspace.id}
                        className={`h-8 w-8 cursor-pointer transition-opacity rounded-lg ${isActive ? 'ring-2 ring-primary' : 'hover:opacity-80'}`}
                        onClick={() => setActiveWorkspace(workspace.id)}
                    >
                        <AvatarImage
                            src={workspace.img ?? ''}
                            alt={workspace.name}
                            className="rounded-lg"
                        />
                        <AvatarFallback
                            className={`text-xs font-medium rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        >
                            {workspace.avatar}
                        </AvatarFallback>
                    </Avatar>
                );
            })}
        </>
    );
}
