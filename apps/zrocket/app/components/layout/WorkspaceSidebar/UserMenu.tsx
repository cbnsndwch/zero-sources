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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function UserMenu() {
    const navigate = useNavigate();

    const [userStatus, setUserStatus] = useState('online');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage
                            src="/avatars/cbnsndwch.jpg"
                            alt="User"
                        />
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
                        <AvatarImage
                            src="/avatars/cbnsndwch.jpg"
                            alt="User"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            U
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">John Doe</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Circle
                                className={`h-2 w-2 rounded-full ${userStatus === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}
                            />
                            {userStatus === 'online' ? 'Active' : 'Away'}
                        </div>
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

                <Dialog>
                    <DialogTrigger asChild>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={e => e.preventDefault()}
                        >
                            <Keyboard className="h-4 w-4 mr-2" />
                            Keyboard shortcuts
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Keyboard Shortcuts</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm">
                                        Navigation
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Open quick switcher</span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                Ctrl+K
                                            </kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Go to home</span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                Ctrl+1
                                            </kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Search messages</span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                Ctrl+F
                                            </kbd>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm">
                                        Messaging
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Send message</span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                Enter
                                            </kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>New line</span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                Shift+Enter
                                            </kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Edit last message</span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                ↑
                                            </kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm">
                                        General
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Preferences</span>
                                                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                    Ctrl+,
                                                </kbd>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Toggle sidebar</span>
                                                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                    Ctrl+Shift+S
                                                </kbd>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Zoom in</span>
                                                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                    Ctrl++
                                                </kbd>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Zoom out</span>
                                                <kbd className="px-2 py-1 bg-muted rounded text-xs">
                                                    Ctrl+-
                                                </kbd>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
