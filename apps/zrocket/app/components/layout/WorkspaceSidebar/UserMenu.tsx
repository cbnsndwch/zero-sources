import {
    Bell,
    Circle,
    Clock,
    File,
    HelpCircle,
    Keyboard,
    LogOut,
    Settings,
    User
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';

export default function UserMenu() {
    const navigate = useNavigate();

    const [userStatus, setUserStatus] = useState('online');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src="/avatars/cbnsndwch.jpg" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            U
                        </AvatarFallback>
                    </Avatar>
                    <Circle
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${userStatus === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                side="right"
                className="w-56 mb-2"
            >
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage src="/avatars/cbnsndwch.jpg" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            U
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <div className="font-medium">Made by Serge</div>
                        <a
                            href="https://x.com/cbnsndwch"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                        >
                            <Badge
                                variant="secondary"
                                className="text-xs justify-start items-center gap-1 hover:bg-muted-foreground/20 transition-colors"
                            >
                                @cbnsndwch
                            </Badge>
                        </a>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() =>
                        setUserStatus(
                            userStatus === 'online' ? 'away' : 'online'
                        )
                    }
                    className="cursor-pointer"
                >
                    <Clock className="h-4 w-4 mr-2" />
                    {userStatus === 'online'
                        ? 'Set yourself as away'
                        : 'Set yourself as active'}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/preferences?tab=profile')}
                >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/preferences?tab=preferences')}
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/preferences?tab=notifications')}
                >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/files')}
                >
                    <File className="h-4 w-4 mr-2" />
                    Files
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <KeyboardShortcutsDialog>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={e => e.preventDefault()}
                    >
                        <Keyboard className="h-4 w-4 mr-2" />
                        Keyboard shortcuts
                    </DropdownMenuItem>
                </KeyboardShortcutsDialog>

                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/support')}
                >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                </DropdownMenuItem>

                {/* Development Tools */}
                {process.env.NODE_ENV !== 'production' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Dev Tools
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                                (window.location.href =
                                    '/api/auth/dev/login/alice.johnson')
                            }
                        >
                            <User className="h-4 w-4 mr-2" />
                            Login as Alice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                                (window.location.href =
                                    '/api/auth/dev/login/bob.smith')
                            }
                        >
                            <User className="h-4 w-4 mr-2" />
                            Login as Bob
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer text-orange-600 focus:text-orange-600"
                            onClick={() =>
                                (window.location.href = '/api/auth/dev/logout')
                            }
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Dev Logout
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
