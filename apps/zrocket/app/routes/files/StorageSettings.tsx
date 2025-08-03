import { useState } from 'react';
import { Download, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function StorageSettings() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Files
                </CardTitle>
                <CardDescription>Manage your files and media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search downloads..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline">Clear All</Button>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Storage Settings</CardTitle>
                        <CardDescription>
                            Configure how downloads are stored and managed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="download-location">
                                Default Download Location
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="download-location"
                                    value="/Users/johndoe/Downloads"
                                    readOnly
                                    className="flex-1"
                                />
                                <Button variant="outline">Browse</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="auto-cleanup">
                                Auto-cleanup old downloads
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically remove downloads older than 30
                                days
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
