import { BuildingIcon } from 'lucide-react';

import type { SpaceSummary } from '../contracts';

// TODO: read from zero
export const spaces: SpaceSummary[] = [
    {
        title: 'cbnsndwch LLC',
        url: '#',
        icon: BuildingIcon,
        avatar: '/avatars/cbnsndwch.jpg',
        isActive: true
    },
    {
        title: 'Rocicorp',
        url: '#',
        icon: BuildingIcon,
        avatar: '/avatars/rocicorp.webp',
        isActive: false
    }
];
