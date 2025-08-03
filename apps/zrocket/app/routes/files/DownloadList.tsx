import { useMemo } from 'react';
import { Download, Trash2 } from 'lucide-react';

import { downloads, TYPE_COLOR } from './constants';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
    searchQuery: string;
};

export default function DownloadList({ searchQuery }: Props) {
    const filteredDownloads = useMemo(
        () =>
            downloads.filter(download =>
                download.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [searchQuery]
    );

    return (
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
                                        className={TYPE_COLOR[download.type]}
                                    >
                                        {download.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{download.size}</span>
                                    <span>•</span>
                                    <span>{download.downloadedAt}</span>
                                    <span>•</span>
                                    <span>from {download.downloadedFrom}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
