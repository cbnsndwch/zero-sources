import { BookOpen, Video, FileText, ExternalLink, Clock } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const articles = [
    {
        id: 1,
        title: 'Getting Started with Messaging',
        description:
            'Learn the basics of sending messages, creating channels, and organizing conversations.',
        category: 'Basics',
        readTime: '5 min',
        type: 'article'
    },
    {
        id: 2,
        title: 'Advanced Channel Management',
        description:
            'Master channel permissions, notifications, and advanced organizational features.',
        category: 'Advanced',
        readTime: '10 min',
        type: 'article'
    },
    {
        id: 3,
        title: 'Collaboration Best Practices',
        description:
            'Tips and tricks for effective team communication and project coordination.',
        category: 'Best Practices',
        readTime: '8 min',
        type: 'article'
    },
    {
        id: 4,
        title: 'Video Tutorial: Setting Up Your Workspace',
        description:
            'A comprehensive video walkthrough of workspace configuration and customization.',
        category: 'Tutorial',
        readTime: '15 min',
        type: 'video'
    },
    {
        id: 5,
        title: 'Integration Guide',
        description:
            'Connect your favorite tools and services to streamline your workflow.',
        category: 'Integrations',
        readTime: '12 min',
        type: 'guide'
    },
    {
        id: 6,
        title: 'Security and Privacy Settings',
        description:
            'Configure your privacy settings and understand our security features.',
        category: 'Security',
        readTime: '7 min',
        type: 'article'
    }
];

const categories = [
    'All',
    'Basics',
    'Advanced',
    'Best Practices',
    'Tutorial',
    'Integrations',
    'Security'
];

export default function Learn() {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="h-4 w-4" />;
            case 'guide':
                return <FileText className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold mb-2">Learning Center</h2>
                <p className="text-muted-foreground">
                    Discover articles, tutorials, and guides to help you make
                    the most of our platform.
                </p>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <Badge
                        key={category}
                        variant={category === 'All' ? 'default' : 'secondary'}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                        {category}
                    </Badge>
                ))}
            </div>

            {/* Featured Article */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge>Featured</Badge>
                        <Badge variant="outline">New</Badge>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Complete Platform Overview
                    </CardTitle>
                    <CardDescription>
                        A comprehensive 20-minute video tutorial covering all
                        major features and best practices for new users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                20 min
                            </div>
                            <Badge variant="secondary">Tutorial</Badge>
                        </div>
                        <Button>
                            Watch Now
                            <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map(article => (
                    <Card
                        key={article.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">
                                    {article.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {article.readTime}
                                </div>
                            </div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {getTypeIcon(article.type)}
                                {article.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {article.description}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>
                        Frequently accessed resources and external documentation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">
                                        API Documentation
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Developer resources
                                    </div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                        >
                            <div className="flex items-center gap-3">
                                <Video className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">
                                        Video Tutorials
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Step-by-step guides
                                    </div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start h-auto p-4"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5" />
                                <div className="text-left">
                                    <div className="font-medium">
                                        Release Notes
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Latest updates
                                    </div>
                                </div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
