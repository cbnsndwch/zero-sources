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

export default function NotificationsTab() {
    // Original values for comparison
    const originalDesktopSettings = {
        desktop: true,
        directMessages: true,
        mentions: true,
        channelMessages: false,
        reactions: true,
        threads: true
    };

    const originalEmailSettings = {
        email: true,
        emailFrequency: 'immediate'
    };

    const originalQuietHours = {
        enabled: true,
        start: '22:00',
        end: '08:00'
    };

    const originalChannelSettings = {
        muteAll: false,
        keywords: ['urgent', 'important']
    };

    // Current state
    const [desktopSettings, setDesktopSettings] = useState(originalDesktopSettings);
    const [emailSettings, setEmailSettings] = useState(originalEmailSettings);
    const [quietHours, setQuietHours] = useState(originalQuietHours);
    const [channelSettings, setChannelSettings] = useState(originalChannelSettings);

    // Check for changes functions
    const hasDesktopChanges = JSON.stringify(desktopSettings) !== JSON.stringify(originalDesktopSettings);
    const hasEmailChanges = JSON.stringify(emailSettings) !== JSON.stringify(originalEmailSettings);
    const hasQuietHoursChanges = JSON.stringify(quietHours) !== JSON.stringify(originalQuietHours);
    const hasChannelChanges = JSON.stringify(channelSettings) !== JSON.stringify(originalChannelSettings);

    const handleSaveDesktop = () => {
        console.log('Saving desktop notification preferences:', desktopSettings);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveEmail = () => {
        console.log('Saving email notification preferences:', emailSettings);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveQuietHours = () => {
        console.log('Saving quiet hours preferences:', quietHours);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveChannels = () => {
        console.log('Saving channel notification preferences:', channelSettings);
        // TODO: Save to backend/Zero and update original values
    };

    return (
        <div className="space-y-6">
            {/* Desktop Notifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Desktop Notifications
                            </CardTitle>
                            <CardDescription>
                                Configure when and how you receive desktop notifications
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveDesktop} disabled={!hasDesktopChanges}>
                            Save
                        </Button>
                    </div>
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
                            checked={desktopSettings.desktop}
                            onCheckedChange={checked =>
                                setDesktopSettings({
                                    ...desktopSettings,
                                    desktop: checked
                                })
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
                            checked={desktopSettings.directMessages}
                            onCheckedChange={checked =>
                                setDesktopSettings({
                                    ...desktopSettings,
                                    directMessages: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>@Mentions</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when someone mentions you
                            </p>
                        </div>
                        <Switch
                            checked={desktopSettings.mentions}
                            onCheckedChange={checked =>
                                setDesktopSettings({
                                    ...desktopSettings,
                                    mentions: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Channel Messages</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified for all channel messages
                            </p>
                        </div>
                        <Switch
                            checked={desktopSettings.channelMessages}
                            onCheckedChange={checked =>
                                setDesktopSettings({
                                    ...desktopSettings,
                                    channelMessages: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Reactions</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when someone reacts to your messages
                            </p>
                        </div>
                        <Switch
                            checked={desktopSettings.reactions}
                            onCheckedChange={checked =>
                                setDesktopSettings({
                                    ...desktopSettings,
                                    reactions: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Thread Replies</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified for replies to threads you're following
                            </p>
                        </div>
                        <Switch
                            checked={desktopSettings.threads}
                            onCheckedChange={checked =>
                                setDesktopSettings({
                                    ...desktopSettings,
                                    threads: checked
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Email Notifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Email Notifications
                            </CardTitle>
                            <CardDescription>
                                Control how often you receive email notifications
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveEmail} disabled={!hasEmailChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive important notifications via email
                            </p>
                        </div>
                        <Switch
                            checked={emailSettings.email}
                            onCheckedChange={checked =>
                                setEmailSettings({
                                    ...emailSettings,
                                    email: checked
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emailFrequency">Email Frequency</Label>
                        <Select
                            value={emailSettings.emailFrequency}
                            onValueChange={value =>
                                setEmailSettings({
                                    ...emailSettings,
                                    emailFrequency: value
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="hourly">Hourly Digest</SelectItem>
                                <SelectItem value="daily">Daily Digest</SelectItem>
                                <SelectItem value="weekly">Weekly Digest</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Quiet Hours
                            </CardTitle>
                            <CardDescription>
                                Set times when you don't want to receive notifications
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveQuietHours} disabled={!hasQuietHoursChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Quiet Hours</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically disable notifications during set hours
                            </p>
                        </div>
                        <Switch
                            checked={quietHours.enabled}
                            onCheckedChange={checked =>
                                setQuietHours({
                                    ...quietHours,
                                    enabled: checked
                                })
                            }
                        />
                    </div>

                    {quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Select
                                    value={quietHours.start}
                                    onValueChange={value =>
                                        setQuietHours({
                                            ...quietHours,
                                            start: value
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }, (_, i) => {
                                            const hour = i.toString().padStart(2, '0');
                                            return (
                                                <SelectItem key={i} value={`${hour}:00`}>
                                                    {hour}:00
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Select
                                    value={quietHours.end}
                                    onValueChange={value =>
                                        setQuietHours({
                                            ...quietHours,
                                            end: value
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 24 }, (_, i) => {
                                            const hour = i.toString().padStart(2, '0');
                                            return (
                                                <SelectItem key={i} value={`${hour}:00`}>
                                                    {hour}:00
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Channel Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AtSign className="h-5 w-5" />
                                Channel Settings
                            </CardTitle>
                            <CardDescription>
                                Configure channel-specific notification preferences
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveChannels} disabled={!hasChannelChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Mute All Channels</Label>
                            <p className="text-sm text-muted-foreground">
                                Temporarily mute notifications from all channels
                            </p>
                        </div>
                        <Switch
                            checked={channelSettings.muteAll}
                            onCheckedChange={checked =>
                                setChannelSettings({
                                    ...channelSettings,
                                    muteAll: checked
                                })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Notification Keywords</Label>
                        <p className="text-sm text-muted-foreground">
                            Get notified when these keywords are mentioned (comma-separated)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {channelSettings.keywords.map((keyword: string, index: number) => (
                                <span
                                    key={index}
                                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
