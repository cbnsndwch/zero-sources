import { useState } from 'react';

import { Bell, MessageSquare, AtSign, Settings } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export const NotificationsTab = () => {
    const [notifications, setNotifications] = useState({
        desktop: true,
        email: true,
        mobile: true,
        directMessages: true,
        mentions: true,
        channelMessages: false,
        reactions: true,
        threads: true,
        emailFrequency: 'immediate',
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
        },
        channels: {
            muteAll: false,
            keywords: ['urgent', 'important']
        }
    });

    const handleNotificationChange = (key: string, value: boolean | string) => {
        setNotifications(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        console.log('Saving notification preferences:', notifications);
    };

    return (
        <div className="space-y-6">
            {/* Desktop Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Desktop Notifications
                    </CardTitle>
                    <CardDescription>
                        Configure when and how you receive desktop notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Desktop Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Show notifications on your desktop
                            </p>
                        </div>
                        <Switch
                            checked={notifications.desktop}
                            onCheckedChange={checked =>
                                handleNotificationChange('desktop', checked)
                            }
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Direct Messages</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified for all direct messages
                            </p>
                        </div>
                        <Switch
                            checked={notifications.directMessages}
                            onCheckedChange={checked =>
                                handleNotificationChange(
                                    'directMessages',
                                    checked
                                )
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2">
                                <AtSign className="h-4 w-4" />
                                Mentions
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when someone mentions you
                            </p>
                        </div>
                        <Switch
                            checked={notifications.mentions}
                            onCheckedChange={checked =>
                                handleNotificationChange('mentions', checked)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>All Channel Messages</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified for every message in channels
                            </p>
                        </div>
                        <Switch
                            checked={notifications.channelMessages}
                            onCheckedChange={checked =>
                                handleNotificationChange(
                                    'channelMessages',
                                    checked
                                )
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Reactions</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when someone reacts to your
                                messages
                            </p>
                        </div>
                        <Switch
                            checked={notifications.reactions}
                            onCheckedChange={checked =>
                                handleNotificationChange('reactions', checked)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Thread Replies
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified for replies in threads you're part
                                of
                            </p>
                        </div>
                        <Switch
                            checked={notifications.threads}
                            onCheckedChange={checked =>
                                handleNotificationChange('threads', checked)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Email Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                        Control how often you receive email notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications via email
                            </p>
                        </div>
                        <Switch
                            checked={notifications.email}
                            onCheckedChange={checked =>
                                handleNotificationChange('email', checked)
                            }
                        />
                    </div>

                    {notifications.email && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Email Frequency</Label>
                                <Select
                                    value={notifications.emailFrequency}
                                    onValueChange={value =>
                                        handleNotificationChange(
                                            'emailFrequency',
                                            value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="immediate">
                                            Immediate
                                        </SelectItem>
                                        <SelectItem value="hourly">
                                            Hourly Digest
                                        </SelectItem>
                                        <SelectItem value="daily">
                                            Daily Digest
                                        </SelectItem>
                                        <SelectItem value="weekly">
                                            Weekly Digest
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Quiet Hours
                    </CardTitle>
                    <CardDescription>
                        Set times when you don't want to receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Quiet Hours</Label>
                            <p className="text-sm text-muted-foreground">
                                Pause notifications during specified hours
                            </p>
                        </div>
                        <Switch
                            checked={notifications.quietHours.enabled}
                            onCheckedChange={checked =>
                                setNotifications(prev => ({
                                    ...prev,
                                    quietHours: {
                                        ...prev.quietHours,
                                        enabled: checked
                                    }
                                }))
                            }
                        />
                    </div>

                    {notifications.quietHours.enabled && (
                        <>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Select
                                        value={notifications.quietHours.start}
                                        onValueChange={value =>
                                            setNotifications(prev => ({
                                                ...prev,
                                                quietHours: {
                                                    ...prev.quietHours,
                                                    start: value
                                                }
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(
                                                { length: 24 },
                                                (_, i) => {
                                                    const hour = i
                                                        .toString()
                                                        .padStart(2, '0');
                                                    return (
                                                        <SelectItem
                                                            key={hour}
                                                            value={`${hour}:00`}
                                                        >
                                                            {hour}:00
                                                        </SelectItem>
                                                    );
                                                }
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Select
                                        value={notifications.quietHours.end}
                                        onValueChange={value =>
                                            setNotifications(prev => ({
                                                ...prev,
                                                quietHours: {
                                                    ...prev.quietHours,
                                                    end: value
                                                }
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(
                                                { length: 24 },
                                                (_, i) => {
                                                    const hour = i
                                                        .toString()
                                                        .padStart(2, '0');
                                                    return (
                                                        <SelectItem
                                                            key={hour}
                                                            value={`${hour}:00`}
                                                        >
                                                            {hour}:00
                                                        </SelectItem>
                                                    );
                                                }
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="pt-4">
                <Button onClick={handleSave}>
                    Save Notification Preferences
                </Button>
            </div>
        </div>
    );
};
