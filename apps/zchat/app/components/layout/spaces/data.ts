import { BuildingIcon } from 'lucide-react';

import type { SpaceSummary } from '../contracts';

// TODO: read from zero
export const spaces: SpaceSummary[] = [
    {
        title: 'Space 1',
        url: '#',
        icon: BuildingIcon,
        isActive: true
    },
    {
        title: 'Space 2',
        url: '#',
        icon: BuildingIcon,
        isActive: false
    },
    {
        title: 'Space 3',
        url: '#',
        icon: BuildingIcon,
        isActive: false
    },
    {
        title: 'Space 4',
        url: '#',
        icon: BuildingIcon,
        isActive: false
    },
    {
        title: 'Space 5',
        url: '#',
        icon: BuildingIcon,
        isActive: false
    }
];
