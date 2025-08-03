import { Clock, Palette, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTheme, type Theme } from '@/contexts/ThemeContext';

export default function AdvancedTab() {
    const { theme, setTheme } = useTheme();

    // Original values for comparison
    const originalAppearancePrefs = {
        theme: theme,
        language: 'en',
        compactMode: false,
        highContrast: false,
        reducedMotion: false
    };

    const originalDateTimePrefs = {
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    };

    const originalPrivacyPrefs = {
        showOnlineStatus: true,
        autoAwayTimeout: '15',
        startupBehavior: 'last-room'
    };

    // Current state
    const [appearancePrefs, setAppearancePrefs] = useState(
        originalAppearancePrefs
    );
    const [dateTimePrefs, setDateTimePrefs] = useState(originalDateTimePrefs);
    const [privacyPrefs, setPrivacyPrefs] = useState(originalPrivacyPrefs);

    // Check for changes functions
    const hasAppearanceChanges =
        JSON.stringify(appearancePrefs) !==
        JSON.stringify(originalAppearancePrefs);
    const hasDateTimeChanges =
        JSON.stringify(dateTimePrefs) !== JSON.stringify(originalDateTimePrefs);
    const hasPrivacyChanges =
        JSON.stringify(privacyPrefs) !== JSON.stringify(originalPrivacyPrefs);

    // Sync theme from context to local preferences
    useEffect(() => {
        setAppearancePrefs(prev => ({ ...prev, theme }));
    }, [theme]);

    const handleSaveAppearance = () => {
        setTheme(appearancePrefs.theme as 'light' | 'dark' | 'system');
        console.log('Saving appearance preferences:', appearancePrefs);
    };

    const handleSaveDateTime = () => {
        console.log('Saving date/time preferences:', dateTimePrefs);
    };

    const handleSavePrivacy = () => {
        console.log('Saving privacy preferences:', privacyPrefs);
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
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                                value={appearancePrefs.theme}
                                onValueChange={(value: Theme) =>
                                    setAppearancePrefs({
                                        ...appearancePrefs,
                                        theme: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">
                                        System
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={appearancePrefs.language}
                                onValueChange={value =>
                                    setAppearancePrefs({
                                        ...appearancePrefs,
                                        language: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Español</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="de">Deutsch</SelectItem>
                                    <SelectItem value="ja">日本語</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Compact Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Use a more compact interface layout
                            </p>
                        </div>
                        <Switch
                            checked={appearancePrefs.compactMode}
                            onCheckedChange={checked =>
                                setAppearancePrefs({
                                    ...appearancePrefs,
                                    compactMode: checked
                                })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">High Contrast</Label>
                            <p className="text-sm text-muted-foreground">
                                Increase contrast for better accessibility
                            </p>
                        </div>
                        <Switch
                            checked={appearancePrefs.highContrast}
                            onCheckedChange={checked =>
                                setAppearancePrefs({
                                    ...appearancePrefs,
                                    highContrast: checked
                                })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Reduced Motion</Label>
                            <p className="text-sm text-muted-foreground">
                                Minimize animations and transitions
                            </p>
                        </div>
                        <Switch
                            checked={appearancePrefs.reducedMotion}
                            onCheckedChange={checked =>
                                setAppearancePrefs({
                                    ...appearancePrefs,
                                    reducedMotion: checked
                                })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveAppearance}
                            disabled={!hasAppearanceChanges}
                        >
                            Save
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Date & Time
                    </CardTitle>
                    <CardDescription>
                        Configure how dates and times are displayed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                value={dateTimePrefs.timezone}
                                onValueChange={value =>
                                    setDateTimePrefs({
                                        ...dateTimePrefs,
                                        timezone: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/Los_Angeles">
                                        Pacific Time
                                    </SelectItem>
                                    <SelectItem value="America/Denver">
                                        Mountain Time
                                    </SelectItem>
                                    <SelectItem value="America/Chicago">
                                        Central Time
                                    </SelectItem>
                                    <SelectItem value="America/New_York">
                                        Eastern Time
                                    </SelectItem>
                                    <SelectItem value="Europe/London">
                                        GMT
                                    </SelectItem>
                                    <SelectItem value="Europe/Paris">
                                        CET
                                    </SelectItem>
                                    <SelectItem value="Asia/Tokyo">
                                        JST
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date-format">Date Format</Label>
                            <Select
                                value={dateTimePrefs.dateFormat}
                                onValueChange={value =>
                                    setDateTimePrefs({
                                        ...dateTimePrefs,
                                        dateFormat: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
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
                            <Label htmlFor="time-format">Time Format</Label>
                            <Select
                                value={dateTimePrefs.timeFormat}
                                onValueChange={value =>
                                    setDateTimePrefs({
                                        ...dateTimePrefs,
                                        timeFormat: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12h">12 Hour</SelectItem>
                                    <SelectItem value="24h">24 Hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveDateTime}
                            disabled={!hasDateTimeChanges}
                        >
                            Save
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy & Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy & Status
                    </CardTitle>
                    <CardDescription>
                        Control your privacy and online status settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">
                                Show Online Status
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Let others see when you're online
                            </p>
                        </div>
                        <Switch
                            checked={privacyPrefs.showOnlineStatus}
                            onCheckedChange={checked =>
                                setPrivacyPrefs({
                                    ...privacyPrefs,
                                    showOnlineStatus: checked
                                })
                            }
                        />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="auto-away">Auto-away timeout</Label>
                            <Select
                                value={privacyPrefs.autoAwayTimeout}
                                onValueChange={value =>
                                    setPrivacyPrefs({
                                        ...privacyPrefs,
                                        autoAwayTimeout: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select timeout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="15">
                                        15 minutes
                                    </SelectItem>
                                    <SelectItem value="30">
                                        30 minutes
                                    </SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startup">Startup behavior</Label>
                            <Select
                                value={privacyPrefs.startupBehavior}
                                onValueChange={value =>
                                    setPrivacyPrefs({
                                        ...privacyPrefs,
                                        startupBehavior: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select behavior" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last-room">
                                        Return to last room
                                    </SelectItem>
                                    <SelectItem value="default-room">
                                        Open default room
                                    </SelectItem>
                                    <SelectItem value="home">
                                        Show home screen
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSavePrivacy}
                            disabled={!hasPrivacyChanges}
                        >
                            Save
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// export default function AdvancedTab() {
//     const { theme, setTheme } = useTheme();

//     // Original values for comparison (excluding theme as it's managed by ThemeContext)
//     const originalAppearanceSettings = {
//         density: 'comfortable',
//         fontSize: [14],
//         compactLayout: false,
//         showEmoji: true,
//         autoPlayGifs: true,
//         showPreviews: true
//     };

//     const originalLocalizationSettings = {
//         language: 'en',
//         dateFormat: 'MM/DD/YYYY',
//         timeFormat: '12h'
//     };

//     const originalBehaviorSettings = {
//         showTypingIndicators: true,
//         enterToSend: true,
//         spellCheck: true,
//         autoCorrect: false,
//         messageAnimation: true
//     };

//     const originalAudioSettings = {
//         soundEnabled: true,
//         volume: [75]
//     };

//     // Current state
//     const [appearanceSettings, setAppearanceSettings] = useState(originalAppearanceSettings);
//     const [localizationSettings, setLocalizationSettings] = useState(originalLocalizationSettings);
//     const [behaviorSettings, setBehaviorSettings] = useState(originalBehaviorSettings);
//     const [audioSettings, setAudioSettings] = useState(originalAudioSettings);

//     // Check for changes functions
//     const hasAppearanceChanges = JSON.stringify(appearanceSettings) !== JSON.stringify(originalAppearanceSettings);
//     const hasLocalizationChanges = JSON.stringify(localizationSettings) !== JSON.stringify(originalLocalizationSettings);
//     const hasBehaviorChanges = JSON.stringify(behaviorSettings) !== JSON.stringify(originalBehaviorSettings);
//     const hasAudioChanges = JSON.stringify(audioSettings) !== JSON.stringify(originalAudioSettings);

//     const handleSaveAppearance = () => {
//         console.log('Saving appearance preferences:', appearanceSettings);
//         // TODO: Save to backend/Zero and update original values
//     };

//     const handleSaveLocalization = () => {
//         console.log('Saving localization preferences:', localizationSettings);
//         // TODO: Save to backend/Zero and update original values
//     };

//     const handleSaveBehavior = () => {
//         console.log('Saving behavior preferences:', behaviorSettings);
//         // TODO: Save to backend/Zero and update original values
//     };

//     const handleSaveAudio = () => {
//         console.log('Saving audio preferences:', audioSettings);
//         // TODO: Save to backend/Zero and update original values
//     };

//     return (
//         <div className="space-y-6">
//             {/* Appearance */}
//             <Card>
//                 <CardHeader>
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <CardTitle className="flex items-center gap-2">
//                                 <Palette className="h-5 w-5" />
//                                 Appearance
//                             </CardTitle>
//                             <CardDescription>
//                                 Customize the look and feel of your interface
//                             </CardDescription>
//                         </div>
//                         <Button onClick={handleSaveAppearance} disabled={!hasAppearanceChanges}>
//                             Save
//                         </Button>
//                     </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="space-y-3">
//                         <Label>Theme</Label>
//                         <RadioGroup
//                             value={theme}
//                             onValueChange={setTheme}
//                             className="flex gap-6"
//                         >
//                             <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="light" id="light" />
//                                 <Label htmlFor="light">Light</Label>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="dark" id="dark" />
//                                 <Label htmlFor="dark">Dark</Label>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="system" id="system" />
//                                 <Label htmlFor="system">System</Label>
//                             </div>
//                         </RadioGroup>
//                     </div>

//                     <Separator />

//                     <div className="space-y-3">
//                         <Label>Interface Density</Label>
//                         <RadioGroup
//                             value={appearanceSettings.density}
//                             onValueChange={value =>
//                                 setAppearanceSettings({
//                                     ...appearanceSettings,
//                                     density: value
//                                 })
//                             }
//                             className="flex gap-6"
//                         >
//                             <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="compact" id="compact" />
//                                 <Label htmlFor="compact">Compact</Label>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="comfortable" id="comfortable" />
//                                 <Label htmlFor="comfortable">Comfortable</Label>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <RadioGroupItem value="spacious" id="spacious" />
//                                 <Label htmlFor="spacious">Spacious</Label>
//                             </div>
//                         </RadioGroup>
//                     </div>

//                     <div className="space-y-3">
//                         <Label>Font Size: {appearanceSettings.fontSize[0]}px</Label>
//                         <Slider
//                             value={appearanceSettings.fontSize}
//                             onValueChange={value =>
//                                 setAppearanceSettings({
//                                     ...appearanceSettings,
//                                     fontSize: value
//                                 })
//                             }
//                             max={20}
//                             min={10}
//                             step={1}
//                             className="w-full"
//                         />
//                     </div>

//                     <Separator />

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Compact Layout</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Use a more compact message layout
//                             </p>
//                         </div>
//                         <Switch
//                             checked={appearanceSettings.compactLayout}
//                             onCheckedChange={checked =>
//                                 setAppearanceSettings({
//                                     ...appearanceSettings,
//                                     compactLayout: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Show Emoji</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Display emoji in messages and reactions
//                             </p>
//                         </div>
//                         <Switch
//                             checked={appearanceSettings.showEmoji}
//                             onCheckedChange={checked =>
//                                 setAppearanceSettings({
//                                     ...appearanceSettings,
//                                     showEmoji: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Auto-play GIFs</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Automatically play animated images
//                             </p>
//                         </div>
//                         <Switch
//                             checked={appearanceSettings.autoPlayGifs}
//                             onCheckedChange={checked =>
//                                 setAppearanceSettings({
//                                     ...appearanceSettings,
//                                     autoPlayGifs: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Show Link Previews</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Display previews for shared links
//                             </p>
//                         </div>
//                         <Switch
//                             checked={appearanceSettings.showPreviews}
//                             onCheckedChange={checked =>
//                                 setAppearanceSettings({
//                                     ...appearanceSettings,
//                                     showPreviews: checked
//                                 })
//                             }
//                         />
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Localization */}
//             <Card>
//                 <CardHeader>
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <CardTitle className="flex items-center gap-2">
//                                 <Globe className="h-5 w-5" />
//                                 Localization
//                             </CardTitle>
//                             <CardDescription>
//                                 Configure language and regional settings
//                             </CardDescription>
//                         </div>
//                         <Button onClick={handleSaveLocalization} disabled={!hasLocalizationChanges}>
//                             Save
//                         </Button>
//                     </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="language">Language</Label>
//                             <Select
//                                 value={localizationSettings.language}
//                                 onValueChange={value =>
//                                     setLocalizationSettings({
//                                         ...localizationSettings,
//                                         language: value
//                                     })
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select language" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="en">English</SelectItem>
//                                     <SelectItem value="es">Español</SelectItem>
//                                     <SelectItem value="fr">Français</SelectItem>
//                                     <SelectItem value="de">Deutsch</SelectItem>
//                                     <SelectItem value="it">Italiano</SelectItem>
//                                     <SelectItem value="pt">Português</SelectItem>
//                                     <SelectItem value="ja">日本語</SelectItem>
//                                     <SelectItem value="ko">한국어</SelectItem>
//                                     <SelectItem value="zh">中文</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="dateFormat">Date Format</Label>
//                             <Select
//                                 value={localizationSettings.dateFormat}
//                                 onValueChange={value =>
//                                     setLocalizationSettings({
//                                         ...localizationSettings,
//                                         dateFormat: value
//                                     })
//                                 }
//                             >
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select date format" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
//                                     <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
//                                     <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
//                                     <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <Label htmlFor="timeFormat">Time Format</Label>
//                         <Select
//                             value={localizationSettings.timeFormat}
//                             onValueChange={value =>
//                                 setLocalizationSettings({
//                                     ...localizationSettings,
//                                     timeFormat: value
//                                 })
//                             }
//                         >
//                             <SelectTrigger className="w-full md:w-[200px]">
//                                 <SelectValue placeholder="Select time format" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
//                                 <SelectItem value="24h">24-hour</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Behavior */}
//             <Card>
//                 <CardHeader>
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <CardTitle className="flex items-center gap-2">
//                                 <Keyboard className="h-5 w-5" />
//                                 Behavior
//                             </CardTitle>
//                             <CardDescription>
//                                 Configure how the app behaves and responds
//                             </CardDescription>
//                         </div>
//                         <Button onClick={handleSaveBehavior} disabled={!hasBehaviorChanges}>
//                             Save
//                         </Button>
//                     </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Show Typing Indicators</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Show when others are typing
//                             </p>
//                         </div>
//                         <Switch
//                             checked={behaviorSettings.showTypingIndicators}
//                             onCheckedChange={checked =>
//                                 setBehaviorSettings({
//                                     ...behaviorSettings,
//                                     showTypingIndicators: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Enter to Send</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Send messages by pressing Enter (Shift+Enter for new line)
//                             </p>
//                         </div>
//                         <Switch
//                             checked={behaviorSettings.enterToSend}
//                             onCheckedChange={checked =>
//                                 setBehaviorSettings({
//                                     ...behaviorSettings,
//                                     enterToSend: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Spell Check</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Check spelling while typing
//                             </p>
//                         </div>
//                         <Switch
//                             checked={behaviorSettings.spellCheck}
//                             onCheckedChange={checked =>
//                                 setBehaviorSettings({
//                                     ...behaviorSettings,
//                                     spellCheck: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Auto Correct</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Automatically correct common typing mistakes
//                             </p>
//                         </div>
//                         <Switch
//                             checked={behaviorSettings.autoCorrect}
//                             onCheckedChange={checked =>
//                                 setBehaviorSettings({
//                                     ...behaviorSettings,
//                                     autoCorrect: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Message Animations</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Enable smooth animations for new messages
//                             </p>
//                         </div>
//                         <Switch
//                             checked={behaviorSettings.messageAnimation}
//                             onCheckedChange={checked =>
//                                 setBehaviorSettings({
//                                     ...behaviorSettings,
//                                     messageAnimation: checked
//                                 })
//                             }
//                         />
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Audio */}
//             <Card>
//                 <CardHeader>
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <CardTitle className="flex items-center gap-2">
//                                 <Monitor className="h-5 w-5" />
//                                 Audio Settings
//                             </CardTitle>
//                             <CardDescription>
//                                 Configure sound and audio preferences
//                             </CardDescription>
//                         </div>
//                         <Button onClick={handleSaveAudio} disabled={!hasAudioChanges}>
//                             Save
//                         </Button>
//                     </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="flex items-center justify-between">
//                         <div className="space-y-0.5">
//                             <Label>Enable Sounds</Label>
//                             <p className="text-sm text-muted-foreground">
//                                 Play notification and UI sounds
//                             </p>
//                         </div>
//                         <Switch
//                             checked={audioSettings.soundEnabled}
//                             onCheckedChange={checked =>
//                                 setAudioSettings({
//                                     ...audioSettings,
//                                     soundEnabled: checked
//                                 })
//                             }
//                         />
//                     </div>

//                     {audioSettings.soundEnabled && (
//                         <div className="space-y-3">
//                             <Label>Volume: {audioSettings.volume[0]}%</Label>
//                             <Slider
//                                 value={audioSettings.volume}
//                                 onValueChange={value =>
//                                     setAudioSettings({
//                                         ...audioSettings,
//                                         volume: value
//                                     })
//                                 }
//                                 max={100}
//                                 min={0}
//                                 step={5}
//                                 className="w-full"
//                             />
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };
