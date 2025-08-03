import { Download, FolderOpen, File } from 'lucide-react';

import { downloads, totalSize } from './constants';

import { Card, CardContent } from '@/components/ui/card';

export default function Statistics() {
    return (
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
                                {new Set(downloads.map(d => d.type)).size}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                File Types
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
