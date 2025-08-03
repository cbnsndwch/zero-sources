import {
    Download,
    File,
    FolderOpen,
    Image,
    Music,
    Search,
    Trash2,
    Video
} from 'lucide-react';
import { useState } from 'react';

import { UserPreferencesLayout } from '@/components/layout/UserPreferencesLayout';
import { Badge } from '@/components/ui/badge';
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

export default function FilesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock downloads data
    const [downloads] = useState([
        {
            id: '1',
            name: 'project-presentation.pdf',
            type: 'pdf',
            size: '2.4 MB',
            downloadedAt: '2 hours ago',
            downloadedFrom: '#general',
            icon: File
        },
        {
            id: '2',
            name: 'team-photo.jpg',
            type: 'image',
            size: '1.8 MB',
            downloadedAt: '1 day ago',
            downloadedFrom: '#random',
            icon: Image
        },
        {
            id: '3',
            name: 'demo-video.mp4',
            type: 'video',
            size: '15.2 MB',
            downloadedAt: '3 days ago',
            downloadedFrom: '#design',
            icon: Video
        },
        {
            id: '4',
            name: 'background-music.mp3',
            type: 'audio',
            size: '4.1 MB',
            downloadedAt: '1 week ago',
            downloadedFrom: '#music',
            icon: Music
        },
        {
            id: '5',
            name: 'requirements.docx',
            type: 'document',
            size: '856 KB',
            downloadedAt: '2 weeks ago',
            downloadedFrom: '#development',
            icon: File
        }
    ]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'image':
                return 'bg-green-100 text-green-800';
            case 'video':
                return 'bg-blue-100 text-blue-800';
            case 'audio':
                return 'bg-purple-100 text-purple-800';
            case 'pdf':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredDownloads = downloads.filter(download =>
        download.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalSize = downloads.reduce((acc, download) => {
        const size = parseFloat(download.size.split(' ')[0]);
        const unit = download.size.split(' ')[1];
        const sizeInMB = unit === 'KB' ? size / 1024 : size;
        return acc + sizeInMB;
    }, 0);

    return (
        <UserPreferencesLayout
            title="Files"
            description="Manage your downloads and file storage"
        >
            <div className="space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {downloads.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Downloads
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <FolderOpen className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {totalSize.toFixed(1)} MB
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Size
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <File className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {
                                            new Set(downloads.map(d => d.type))
                                                .size
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        File Types
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Downloads List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Files
                        </CardTitle>
                        <CardDescription>
                            Manage your files and media
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search downloads..."
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline">Clear All</Button>
                        </div>

                        <Separator />

                        {/* Downloads List */}
                        <div className="space-y-3">
                            {filteredDownloads.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No downloads found</p>
                                    <p className="text-sm">
                                        Files you download will appear here
                                    </p>
                                </div>
                            ) : (
                                filteredDownloads.map(download => {
                                    const IconComponent = download.icon;
                                    return (
                                        <div
                                            key={download.id}
                                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="p-2 rounded-lg bg-muted">
                                                <IconComponent className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium truncate">
                                                        {download.name}
                                                    </p>
                                                    <Badge
                                                        variant="secondary"
                                                        className={getTypeColor(
                                                            download.type
                                                        )}
                                                    >
                                                        {download.type}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{download.size}</span>
                                                    <span>•</span>
                                                    <span>
                                                        {download.downloadedAt}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        from{' '}
                                                        {
                                                            download.downloadedFrom
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Settings */}
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
            </div>
        </UserPreferencesLayout>
    );
}
