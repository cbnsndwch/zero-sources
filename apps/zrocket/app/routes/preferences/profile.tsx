import { useState } from 'react';

import { Edit2, User, Mail, Calendar, MapPin, Globe } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileTab() {
    // Original values for comparison
    const originalProfileInfo = {
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Software engineer passionate about building great user experiences',
        avatarUrl: '/lovable-uploads/3658d516-e621-4d21-83bf-d04d79ea3c27.png'
    };

    const originalContactInfo = {
        email: 'john.doe@example.com',
        additionalEmails: ['john.work@company.com', 'j.doe@personal.com']
    };

    const originalPresenceInfo = {
        presence: 'ONLINE',
        presenceText: 'Working on exciting projects',
        defaultRoom: '#general'
    };

    const originalAdditionalInfo = {
        location: 'San Francisco, CA',
        timezone: 'PST',
        website: 'https://johndoe.dev'
    };

    // Current state
    const [profileInfo, setProfileInfo] = useState(originalProfileInfo);
    const [contactInfo, setContactInfo] = useState(originalContactInfo);
    const [presenceInfo, setPresenceInfo] = useState(originalPresenceInfo);
    const [additionalInfo, setAdditionalInfo] = useState(originalAdditionalInfo);

    // Check for changes functions
    const hasProfileChanges = JSON.stringify(profileInfo) !== JSON.stringify(originalProfileInfo);
    const hasContactChanges = JSON.stringify(contactInfo) !== JSON.stringify(originalContactInfo);
    const hasPresenceChanges = JSON.stringify(presenceInfo) !== JSON.stringify(originalPresenceInfo);
    const hasAdditionalChanges = JSON.stringify(additionalInfo) !== JSON.stringify(originalAdditionalInfo);

    const handleSaveProfile = () => {
        console.log('Saving profile information:', profileInfo);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveContact = () => {
        console.log('Saving contact information:', contactInfo);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSavePresence = () => {
        console.log('Saving presence & status:', presenceInfo);
        // TODO: Save to backend/Zero and update original values
    };

    const handleSaveAdditional = () => {
        console.log('Saving additional information:', additionalInfo);
        // TODO: Save to backend/Zero and update original values
    };

    return (
        <div className="space-y-6">
            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your personal information and profile details
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveProfile} disabled={!hasProfileChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profileInfo.avatarUrl} alt="Profile picture" />
                            <AvatarFallback className="text-lg">
                                {profileInfo.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Change Avatar
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                JPG, GIF or PNG. 2MB max.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={profileInfo.name}
                                onChange={e =>
                                    setProfileInfo({
                                        ...profileInfo,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={profileInfo.username}
                                onChange={e =>
                                    setProfileInfo({
                                        ...profileInfo,
                                        username: e.target.value
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us about yourself..."
                            value={profileInfo.bio}
                            onChange={e =>
                                setProfileInfo({
                                    ...profileInfo,
                                    bio: e.target.value
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                            <CardDescription>
                                Manage your email addresses and contact details
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveContact} disabled={!hasContactChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Primary Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={contactInfo.email}
                            onChange={e =>
                                setContactInfo({
                                    ...contactInfo,
                                    email: e.target.value
                                })
                            }
                        />
                    </div>

                    {/* Additional Emails */}
                    <div className="space-y-2">
                        <Label>Additional Email Addresses</Label>
                        <div className="space-y-2">
                            {contactInfo.additionalEmails.map((email: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {email}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newEmails = contactInfo.additionalEmails.filter((_, i) => i !== index);
                                            setContactInfo({
                                                ...contactInfo,
                                                additionalEmails: newEmails
                                            });
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm">
                            Add Email Address
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Presence & Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Presence & Status
                            </CardTitle>
                            <CardDescription>
                                Configure your availability and status messages
                            </CardDescription>
                        </div>
                        <Button onClick={handleSavePresence} disabled={!hasPresenceChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="presence">Status</Label>
                        <Badge variant={presenceInfo.presence === 'ONLINE' ? 'default' : 'secondary'}>
                            {presenceInfo.presence}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="presenceText">Status Message</Label>
                        <Input
                            id="presenceText"
                            value={presenceInfo.presenceText}
                            onChange={e =>
                                setPresenceInfo({
                                    ...presenceInfo,
                                    presenceText: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="defaultRoom">Default Room</Label>
                        <Input
                            id="defaultRoom"
                            value={presenceInfo.defaultRoom}
                            onChange={e =>
                                setPresenceInfo({
                                    ...presenceInfo,
                                    defaultRoom: e.target.value
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                            <CardDescription>
                                Optional information about your location and preferences
                            </CardDescription>
                        </div>
                        <Button onClick={handleSaveAdditional} disabled={!hasAdditionalChanges}>
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={additionalInfo.location}
                                onChange={e =>
                                    setAdditionalInfo({
                                        ...additionalInfo,
                                        location: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Input
                                id="timezone"
                                value={additionalInfo.timezone}
                                onChange={e =>
                                    setAdditionalInfo({
                                        ...additionalInfo,
                                        timezone: e.target.value
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">
                            <Globe className="h-4 w-4 inline mr-1" />
                            Website
                        </Label>
                        <Input
                            id="website"
                            type="url"
                            value={additionalInfo.website}
                            onChange={e =>
                                setAdditionalInfo({
                                    ...additionalInfo,
                                    website: e.target.value
                                })
                            }
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
