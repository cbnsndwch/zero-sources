import { useState } from 'react';

import {
    File,
    Download,
    Folder,
    Trash2,
    Search,
    MoreHorizontal
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const FilesTab = () => {
    const [fileSettings, setFileSettings] = useState({
        autoDownload: true,
        defaultLocation: '/Downloads',
        maxFileSize: '50MB',
        allowedTypes: ['images', 'documents', 'videos'],
        showPreviews: true,
        organizeByDate: false
    });

    // Mock file data
    const [files] = useState([
        {
            id: 1,
            name: 'project-overview.pdf',
            size: '2.3 MB',
            type: 'PDF',
            date: '2025-08-01',
            channel: '#general',
            user: 'john.doe'
        },
        {
            id: 2,
            name: 'design-mockups.fig',
            size: '15.7 MB',
            type: 'Figma',
            date: '2025-07-30',
            channel: '#design',
            user: 'jane.smith'
        },
        {
            id: 3,
            name: 'meeting-notes.docx',
            size: '847 KB',
            type: 'Word',
            date: '2025-07-28',
            channel: '#product',
            user: 'mike.johnson'
        },
        {
            id: 4,
            name: 'screenshot.png',
            size: '1.2 MB',
            type: 'Image',
            date: '2025-07-27',
            channel: '#development',
            user: 'sarah.wilson'
        },
        {
            id: 5,
            name: 'demo-video.mp4',
            size: '89.4 MB',
            type: 'Video',
            date: '2025-07-25',
            channel: '#marketing',
            user: 'alex.brown'
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredFiles = files.filter(file => {
        const matchesSearch =
            file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.user.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
            filterType === 'all' ||
            file.type.toLowerCase().includes(filterType.toLowerCase());
        return matchesSearch && matchesType;
    });

    const handleSave = () => {
        console.log('Saving file preferences:', fileSettings);
    };

    const handleDownload = (fileId: number) => {
        console.log('Downloading file:', fileId);
    };

    const handleDelete = (fileId: number) => {
        console.log('Deleting file:', fileId);
    };

    const formatFileSize = (bytes: string) => {
        return bytes;
    };

    return (
        <div className="space-y-6">
            {/* File Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        File Settings
                    </CardTitle>
                    <CardDescription>
                        Configure how files are handled and stored
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-download Files</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically download files when clicked
                            </p>
                        </div>
                        <Switch
                            checked={fileSettings.autoDownload}
                            onCheckedChange={checked =>
                                setFileSettings(prev => ({
                                    ...prev,
                                    autoDownload: checked
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show File Previews</Label>
                            <p className="text-sm text-muted-foreground">
                                Display thumbnails and previews for supported
                                files
                            </p>
                        </div>
                        <Switch
                            checked={fileSettings.showPreviews}
                            onCheckedChange={checked =>
                                setFileSettings(prev => ({
                                    ...prev,
                                    showPreviews: checked
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Organize by Date</Label>
                            <p className="text-sm text-muted-foreground">
                                Group files by upload date in folders
                            </p>
                        </div>
                        <Switch
                            checked={fileSettings.organizeByDate}
                            onCheckedChange={checked =>
                                setFileSettings(prev => ({
                                    ...prev,
                                    organizeByDate: checked
                                }))
                            }
                        />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Default Download Location</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={fileSettings.defaultLocation}
                                    onChange={e =>
                                        setFileSettings(prev => ({
                                            ...prev,
                                            defaultLocation: e.target.value
                                        }))
                                    }
                                    placeholder="/Downloads"
                                />
                                <Button variant="outline" size="icon">
                                    <Folder className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Maximum File Size</Label>
                            <Select
                                value={fileSettings.maxFileSize}
                                onValueChange={value =>
                                    setFileSettings(prev => ({
                                        ...prev,
                                        maxFileSize: value
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10MB">10 MB</SelectItem>
                                    <SelectItem value="25MB">25 MB</SelectItem>
                                    <SelectItem value="50MB">50 MB</SelectItem>
                                    <SelectItem value="100MB">
                                        100 MB
                                    </SelectItem>
                                    <SelectItem value="500MB">
                                        500 MB
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSave}>Save File Settings</Button>
                    </div>
                </CardContent>
            </Card>

            {/* File Browser */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <File className="h-5 w-5" />
                        Recent Files
                    </CardTitle>
                    <CardDescription>
                        Browse and manage files shared in your conversations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filterType}
                            onValueChange={setFilterType}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="pdf">PDFs</SelectItem>
                                <SelectItem value="word">Documents</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Files Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Shared by</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFiles.map(file => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <File className="h-4 w-4" />
                                                {file.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {file.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatFileSize(file.size)}
                                        </TableCell>
                                        <TableCell>{file.channel}</TableCell>
                                        <TableCell>{file.user}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                file.date
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDownload(
                                                                file.id
                                                            )
                                                        }
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                file.id
                                                            )
                                                        }
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredFiles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No files found matching your search criteria</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
