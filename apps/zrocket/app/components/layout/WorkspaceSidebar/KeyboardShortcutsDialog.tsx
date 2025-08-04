import type { PropsWithChildren } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';

export default function KeyboardShortcutsDialog({
    children
}: PropsWithChildren) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
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
                            <h3 className="font-semibold text-sm">Messaging</h3>
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
                            <h3 className="font-semibold text-sm">General</h3>
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
    );
}
