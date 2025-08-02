import { useState } from 'react';

import { Palette, Monitor, Keyboard, Globe } from 'lucide-react';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

export const PreferencesTab = () => {
    const [preferences, setPreferences] = useState({
        theme: 'system',
        density: 'comfortable',
        fontSize: [14],
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        showEmoji: true,
        autoPlayGifs: true,
        showPreviews: true,
        compactLayout: false,
        showTypingIndicators: true,
        enterToSend: true,
        spellCheck: true,
        autoCorrect: false,
        soundEnabled: true,
        volume: [75],
        messageAnimation: true
    });

    const handlePreferenceChange = (key: string, value: any) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        console.log('Saving preferences:', preferences);
    };

    return (
        <div className="space-y-6">
            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize the look and feel of your interface
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <Label>Theme</Label>
                        <RadioGroup
                            value={preferences.theme}
                            onValueChange={value =>
                                handlePreferenceChange('theme', value)
                            }
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="light" id="light" />
                                <Label htmlFor="light">Light</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dark" id="dark" />
                                <Label htmlFor="dark">Dark</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="system" id="system" />
                                <Label htmlFor="system">System</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <Label>Interface Density</Label>
                        <RadioGroup
                            value={preferences.density}
                            onValueChange={value =>
                                handlePreferenceChange('density', value)
                            }
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="compact" id="compact" />
                                <Label htmlFor="compact">Compact</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="comfortable"
                                    id="comfortable"
                                />
                                <Label htmlFor="comfortable">Comfortable</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="spacious"
                                    id="spacious"
                                />
                                <Label htmlFor="spacious">Spacious</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <Label>Font Size: {preferences.fontSize[0]}px</Label>
                        <Slider
                            value={preferences.fontSize}
                            onValueChange={value =>
                                handlePreferenceChange('fontSize', value)
                            }
                            min={12}
                            max={18}
                            step={1}
                            className="w-full"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Emoji in Messages</Label>
                            <p className="text-sm text-muted-foreground">
                                Display emoji reactions and custom emoji
                            </p>
                        </div>
                        <Switch
                            checked={preferences.showEmoji}
                            onCheckedChange={checked =>
                                handlePreferenceChange('showEmoji', checked)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-play GIFs</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically play animated GIFs in messages
                            </p>
                        </div>
                        <Switch
                            checked={preferences.autoPlayGifs}
                            onCheckedChange={checked =>
                                handlePreferenceChange('autoPlayGifs', checked)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Messaging */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Messaging
                    </CardTitle>
                    <CardDescription>
                        Configure how messages are sent and displayed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enter to Send</Label>
                            <p className="text-sm text-muted-foreground">
                                Press Enter to send messages (Shift+Enter for
                                new line)
                            </p>
                        </div>
                        <Switch
                            checked={preferences.enterToSend}
                            onCheckedChange={checked =>
                                handlePreferenceChange('enterToSend', checked)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Typing Indicators</Label>
                            <p className="text-sm text-muted-foreground">
                                See when others are typing
                            </p>
                        </div>
                        <Switch
                            checked={preferences.showTypingIndicators}
                            onCheckedChange={checked =>
                                handlePreferenceChange(
                                    'showTypingIndicators',
                                    checked
                                )
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Link Previews</Label>
                            <p className="text-sm text-muted-foreground">
                                Display previews for shared links
                            </p>
                        </div>
                        <Switch
                            checked={preferences.showPreviews}
                            onCheckedChange={checked =>
                                handlePreferenceChange('showPreviews', checked)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Spell Check</Label>
                            <p className="text-sm text-muted-foreground">
                                Check spelling while typing
                            </p>
                        </div>
                        <Switch
                            checked={preferences.spellCheck}
                            onCheckedChange={checked =>
                                handlePreferenceChange('spellCheck', checked)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Message Animation</Label>
                            <p className="text-sm text-muted-foreground">
                                Animate new messages appearing
                            </p>
                        </div>
                        <Switch
                            checked={preferences.messageAnimation}
                            onCheckedChange={checked =>
                                handlePreferenceChange(
                                    'messageAnimation',
                                    checked
                                )
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Language & Region */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language & Region
                    </CardTitle>
                    <CardDescription>
                        Set your language and regional preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Select
                                value={preferences.language}
                                onValueChange={value =>
                                    handlePreferenceChange('language', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                    <SelectItem value="it">Italiano</SelectItem>
                                    <SelectItem value="pt">
                                        Português
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select
                                value={preferences.dateFormat}
                                onValueChange={value =>
                                    handlePreferenceChange('dateFormat', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MM/DD/YYYY">
                                        MM/DD/YYYY
                                    </SelectItem>
                                    <SelectItem value="DD/MM/YYYY">
                                        DD/MM/YYYY
                                    </SelectItem>
                                    <SelectItem value="YYYY-MM-DD">
                                        YYYY-MM-DD
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Time Format</Label>
                            <Select
                                value={preferences.timeFormat}
                                onValueChange={value =>
                                    handlePreferenceChange('timeFormat', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12h">12-hour</SelectItem>
                                    <SelectItem value="24h">24-hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audio */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Audio & Sounds
                    </CardTitle>
                    <CardDescription>
                        Configure audio notifications and sound effects
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Sounds</Label>
                            <p className="text-sm text-muted-foreground">
                                Play sounds for notifications and actions
                            </p>
                        </div>
                        <Switch
                            checked={preferences.soundEnabled}
                            onCheckedChange={checked =>
                                handlePreferenceChange('soundEnabled', checked)
                            }
                        />
                    </div>

                    {preferences.soundEnabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <Label>Volume: {preferences.volume[0]}%</Label>
                                <Slider
                                    value={preferences.volume}
                                    onValueChange={value =>
                                        handlePreferenceChange('volume', value)
                                    }
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="pt-4">
                <Button onClick={handleSave}>Save Preferences</Button>
            </div>
        </div>
    );
};
