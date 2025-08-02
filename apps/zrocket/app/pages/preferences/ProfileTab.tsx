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

export const ProfileTab = () => {
    // Mock user data
    const [userProfile, setUserProfile] = useState({
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Software engineer passionate about building great user experiences',
        email: 'john.doe@example.com',
        additionalEmails: ['john.work@company.com', 'j.doe@personal.com'],
        avatarUrl: '/lovable-uploads/3658d516-e621-4d21-83bf-d04d79ea3c27.png',
        presence: 'ONLINE',
        presenceText: 'Working on exciting projects',
        defaultRoom: '#general',
        profile: {
            location: 'San Francisco, CA',
            timezone: 'PST',
            website: 'https://johndoe.dev'
        }
    });

    const handleSave = () => {
        // TODO: Save profile to backend
        console.log('Saving profile:', userProfile);
    };

    return (
        <div className="space-y-6">
            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your personal information and profile details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage
                                src={userProfile.avatarUrl}
                                alt="Profile picture"
                            />
                            <AvatarFallback>
                                {userProfile.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Change Avatar
                            </Button>
                            <p className="text-sm text-muted-foreground mt-1">
                                Upload a new profile picture
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
                                value={userProfile.name}
                                onChange={e =>
                                    setUserProfile({
                                        ...userProfile,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={userProfile.username}
                                onChange={e =>
                                    setUserProfile({
                                        ...userProfile,
                                        username: e.target.value
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={userProfile.bio}
                            onChange={e =>
                                setUserProfile({
                                    ...userProfile,
                                    bio: e.target.value
                                })
                            }
                            placeholder="Tell us about yourself..."
                            rows={3}
                        />
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Contact Information
                        </h4>

                        <div className="space-y-2">
                            <Label htmlFor="email">Primary Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={userProfile.email}
                                onChange={e =>
                                    setUserProfile({
                                        ...userProfile,
                                        email: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Additional Emails</Label>
                            <div className="flex flex-wrap gap-2">
                                {userProfile.additionalEmails.map(
                                    (email, index) => (
                                        <Badge key={index} variant="secondary">
                                            {email}
                                        </Badge>
                                    )
                                )}
                                <Button variant="outline" size="sm">
                                    Add Email
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Profile Details */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">
                            Profile Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="location"
                                    className="flex items-center gap-2"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    value={userProfile.profile.location}
                                    onChange={e =>
                                        setUserProfile({
                                            ...userProfile,
                                            profile: {
                                                ...userProfile.profile,
                                                location: e.target.value
                                            }
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="timezone"
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Timezone
                                </Label>
                                <Input
                                    id="timezone"
                                    value={userProfile.profile.timezone}
                                    onChange={e =>
                                        setUserProfile({
                                            ...userProfile,
                                            profile: {
                                                ...userProfile.profile,
                                                timezone: e.target.value
                                            }
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="website"
                                className="flex items-center gap-2"
                            >
                                <Globe className="h-4 w-4" />
                                Website
                            </Label>
                            <Input
                                id="website"
                                type="url"
                                value={userProfile.profile.website}
                                onChange={e =>
                                    setUserProfile({
                                        ...userProfile,
                                        profile: {
                                            ...userProfile.profile,
                                            website: e.target.value
                                        }
                                    })
                                }
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
