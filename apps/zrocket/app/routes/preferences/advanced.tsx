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
import { useTheme } from '@/contexts/ThemeContext';

export default function AdvancedPreferences() {
    const { theme, setTheme } = useTheme();
    
    // Original values for comparison (excluding theme as it's managed by ThemeContext)
    const originalAppearanceSettings = {
        density: 'comfortable',
        fontSize: [14],
        compactLayout: false,
        showEmoji: true,
        autoPlayGifs: true,
        showPreviews: true
    };

    const originalLocalizationSettings = {
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
    };

    const originalBehaviorSettings = {
        showTypingIndicators: true,
        enterToSend: true,
        spellCheck: true,
        autoCorrect: false,
        messageAnimation: true
    };

    const originalAudioSettings = {
        soundEnabled: true,
        volume: [75]
    };

    // Current state
    const [appearanceSettings, setAppearanceSettings] = useState(originalAppearanceSettings);
    const [localizationSettings, setLocalizationSettings] = useState(originalLocalizationSettings);
    const [behaviorSettings, setBehaviorSettings] = useState(originalBehaviorSettings);
    const [audioSettings, setAudioSettings] = useState(originalAudioSettings);

    // Check for changes functions
    const hasAppearanceChanges = JSON.stringify(appearanceSettings) !== JSON.stringify(originalAppearanceSettings);
    const hasLocalizationChanges = JSON.stringify(localizationSettings) !== JSON.stringify(originalLocalizationSettings);
    const hasBehaviorChanges = JSON.stringify(behaviorSettings) !== JSON.stringify(originalBehaviorSettings);
    const hasAudioChanges = JSON.stringify(audioSettings) !== JSON.stringify(originalAudioSettings);

    const handleSaveAppearance = () => {
        console.log('Saving appearance preferences:', appearanceSettings);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveLocalization = () => {
        console.log('Saving localization preferences:', localizationSettings);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveBehavior = () => {
        console.log('Saving behavior preferences:', behaviorSettings);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveAudio = () => {
        console.log('Saving audio preferences:', audioSettings);
        // TODO: Save to backend/Zero and update original values
    };

    return (
        <div className="space-y-6">
            {/* Appearance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize the look and feel of your interface
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveAppearance} disabled={!hasAppearanceChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <Label>Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={setTheme}
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
                            value={appearanceSettings.density}
                            onValueChange={value =>
                                setAppearanceSettings({
                                    ...appearanceSettings,
                                    density: value
                                })
                            }
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="compact" id="compact" />
                                <Label htmlFor="compact">Compact</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="comfortable" id="comfortable" />
                                <Label htmlFor="comfortable">Comfortable</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="spacious" id="spacious" />
                                <Label htmlFor="spacious">Spacious</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <Label>Font Size: {appearanceSettings.fontSize[0]}px</Label>
                        <Slider
                            value={appearanceSettings.fontSize}
                            onValueChange={value =>
                                setAppearanceSettings({
                                    ...appearanceSettings,
                                    fontSize: value
                                })
                            }
                            max={20}
                            min={10}
                            step={1}
                            className="w-full"
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Compact Layout</Label>
                            <p className="text-sm text-muted-foreground">
                                Use a more compact message layout
                            </p>
                        </div>
                        <Switch
                            checked={appearanceSettings.compactLayout}
                            onCheckedChange={checked =>
                                setAppearanceSettings({
                                    ...appearanceSettings,
                                    compactLayout: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Emoji</Label>
                            <p className="text-sm text-muted-foreground">
                                Display emoji in messages and reactions
                            </p>
                        </div>
                        <Switch
                            checked={appearanceSettings.showEmoji}
                            onCheckedChange={checked =>
                                setAppearanceSettings({
                                    ...appearanceSettings,
                                    showEmoji: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-play GIFs</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically play animated images
                            </p>
                        </div>
                        <Switch
                            checked={appearanceSettings.autoPlayGifs}
                            onCheckedChange={checked =>
                                setAppearanceSettings({
                                    ...appearanceSettings,
                                    autoPlayGifs: checked
                                })
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
                            checked={appearanceSettings.showPreviews}
                            onCheckedChange={checked =>
                                setAppearanceSettings({
                                    ...appearanceSettings,
                                    showPreviews: checked
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Localization */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Localization
                            </CardTitle>
                            <CardDescription>
                                Configure language and regional settings
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveLocalization} disabled={!hasLocalizationChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                                value={localizationSettings.language}
                                onValueChange={value =>
                                    setLocalizationSettings({
                                        ...localizationSettings,
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
                                    <SelectItem value="it">Italiano</SelectItem>
                                    <SelectItem value="pt">Português</SelectItem>
                                    <SelectItem value="ja">日本語</SelectItem>
                                    <SelectItem value="ko">한국어</SelectItem>
                                    <SelectItem value="zh">中文</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select
                                value={localizationSettings.dateFormat}
                                onValueChange={value =>
                                    setLocalizationSettings({
                                        ...localizationSettings,
                                        dateFormat: value
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                    <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timeFormat">Time Format</Label>
                        <Select
                            value={localizationSettings.timeFormat}
                            onValueChange={value =>
                                setLocalizationSettings({
                                    ...localizationSettings,
                                    timeFormat: value
                                })
                            }
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Select time format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                                <SelectItem value="24h">24-hour</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Behavior */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Keyboard className="h-5 w-5" />
                                Behavior
                            </CardTitle>
                            <CardDescription>
                                Configure how the app behaves and responds
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveBehavior} disabled={!hasBehaviorChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Typing Indicators</Label>
                            <p className="text-sm text-muted-foreground">
                                Show when others are typing
                            </p>
                        </div>
                        <Switch
                            checked={behaviorSettings.showTypingIndicators}
                            onCheckedChange={checked =>
                                setBehaviorSettings({
                                    ...behaviorSettings,
                                    showTypingIndicators: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enter to Send</Label>
                            <p className="text-sm text-muted-foreground">
                                Send messages by pressing Enter (Shift+Enter for new line)
                            </p>
                        </div>
                        <Switch
                            checked={behaviorSettings.enterToSend}
                            onCheckedChange={checked =>
                                setBehaviorSettings({
                                    ...behaviorSettings,
                                    enterToSend: checked
                                })
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
                            checked={behaviorSettings.spellCheck}
                            onCheckedChange={checked =>
                                setBehaviorSettings({
                                    ...behaviorSettings,
                                    spellCheck: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto Correct</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically correct common typing mistakes
                            </p>
                        </div>
                        <Switch
                            checked={behaviorSettings.autoCorrect}
                            onCheckedChange={checked =>
                                setBehaviorSettings({
                                    ...behaviorSettings,
                                    autoCorrect: checked
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Message Animations</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable smooth animations for new messages
                            </p>
                        </div>
                        <Switch
                            checked={behaviorSettings.messageAnimation}
                            onCheckedChange={checked =>
                                setBehaviorSettings({
                                    ...behaviorSettings,
                                    messageAnimation: checked
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Audio */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                Audio Settings
                            </CardTitle>
                            <CardDescription>
                                Configure sound and audio preferences
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveAudio} disabled={!hasAudioChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Sounds</Label>
                            <p className="text-sm text-muted-foreground">
                                Play notification and UI sounds
                            </p>
                        </div>
                        <Switch
                            checked={audioSettings.soundEnabled}
                            onCheckedChange={checked =>
                                setAudioSettings({
                                    ...audioSettings,
                                    soundEnabled: checked
                                })
                            }
                        />
                    </div>

                    {audioSettings.soundEnabled && (
                        <div className="space-y-3">
                            <Label>Volume: {audioSettings.volume[0]}%</Label>
                            <Slider
                                value={audioSettings.volume}
                                onValueChange={value =>
                                    setAudioSettings({
                                        ...audioSettings,
                                        volume: value
                                    })
                                }
                                max={100}
                                min={0}
                                step={5}
                                className="w-full"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
