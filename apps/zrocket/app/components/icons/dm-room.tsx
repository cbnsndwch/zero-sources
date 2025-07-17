import { MessageSquareIcon, UserIcon } from 'lucide-react';

export type DmRoomIconProps = {
    className?: string;
};

export default function DmRoomIcon({ className }: DmRoomIconProps) {
    return (
        <span className={className}>
            <MessageSquareIcon className="absolute size-full z-1" />
            <UserIcon
                className="absolute size-1/2 left-1/2 top-1/2 z-2"
                // style={{ position: 'absolute', left: 25, top: 22, zIndex: 2, color: 'white' }}
            />
        </span>
    );
}
