import { File, Image, Music, Video } from 'lucide-react';

import type { Dict } from '@cbnsndwch/zero-contracts';

// Mock downloads data
export const downloads = [
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
] as const;

export const totalSize = downloads.reduce((acc, download) => {
    const size = parseFloat(download.size.split(' ')[0]);
    const unit = download.size.split(' ')[1];
    const sizeInMB = unit === 'KB' ? size / 1024 : size;
    return acc + sizeInMB;
}, 0);

export const TYPE_COLOR: Dict = {
    image: 'bg-green-100 text-green-800',
    video: 'bg-blue-100 text-blue-800',
    audio: 'bg-purple-100 text-purple-800',
    pdf: 'bg-red-100 text-red-800'
} as const;
