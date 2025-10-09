import { MessageSquare, Hash, Lock } from 'lucide-react';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

type EmptyChatProps = {
    roomType: RoomType;
};

export default function EmptyChat({ roomType }: EmptyChatProps) {
    const getRoomTypeInfo = () => {
        switch (roomType) {
            case RoomType.DirectMessages:
                return {
                    icon: MessageSquare,
                    title: 'Direct Messages',
                    description: 'Start a conversation with a team member'
                };
            case RoomType.PublicChannel:
                return {
                    icon: Hash,
                    title: 'Channels',
                    description: 'Join a channel to start collaborating'
                };
            case RoomType.PrivateGroup:
                return {
                    icon: Lock,
                    title: 'Private Groups',
                    description: 'Create or join a private group'
                };
            // case 'starred':
            //     return {
            //         icon: Star,
            //         title: 'Starred Messages',
            //         description: 'Your starred messages will appear here'
            //     };
            // case 'archived':
            //     return {
            //         icon: Archive,
            //         title: 'Archived Conversations',
            //         description: 'Your archived conversations will appear here'
            //     };
            default:
                return {
                    icon: MessageSquare,
                    title: 'Select a conversation',
                    description: 'Choose a conversation to start messaging'
                };
        }
    };

    const { icon: Icon, title, description } = getRoomTypeInfo();

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}
