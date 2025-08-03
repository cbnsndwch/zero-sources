import { Users } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Member {
    _id: string;
    name?: string;
    username?: string;
    status?: 'online' | 'away' | 'offline';
}

interface MembersListProps {
    members: Member[];
}

export function MembersList({ members }: MembersListProps) {
    return (
        <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({members.length})
            </h3>

            <div className="space-y-2">
                {members.map(member => (
                    <div
                        key={member._id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                        <div className="relative">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                    {(member.name || member.username || 'U')
                                        .charAt(0)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                                    member.status === 'online'
                                        ? 'bg-green-500'
                                        : member.status === 'away'
                                          ? 'bg-yellow-500'
                                          : 'bg-gray-400'
                                }`}
                            />
                        </div>
                        <span className="text-sm font-medium">
                            {member.name || member.username}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
