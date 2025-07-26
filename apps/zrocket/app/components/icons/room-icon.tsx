import {
    HashIcon,
    MessageSquareDashedIcon,
    MessageSquareIcon,
    MessageSquareLockIcon
} from 'lucide-react';

import type { RoomType } from '@cbnsndwch/zrocket-contracts';

export type RoomTypeIconProps = {
    t: RoomType;
    className?: string;
};

export default function RoomTypeIcon({ t, className }: RoomTypeIconProps) {
    switch (t) {
        case 'c':
            return <HashIcon className={className} />;
        case 'p':
            return <MessageSquareLockIcon className={className} />;
        case 'd':
            return <MessageSquareIcon className={className} />;
        default:
            return <MessageSquareDashedIcon className={className} />;
    }
}
