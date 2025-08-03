import { useState } from 'react';

import {
    MessageCircle,
    Mail,
    Phone,
    Clock,
    CheckCircle,
    AlertCircle,
    HelpCircle,
    Send,
    Globe,
    Zap
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const supportOptions = [
    {
        title: 'Live Chat',
        description: 'Get instant help from our support team',
        icon: MessageCircle,
        available: '24/7',
        responseTime: '< 5 minutes',
        status: 'online'
    },
    {
        title: 'Email Support',
        description: 'Send us a detailed message about your issue',
        icon: Mail,
        available: 'Always',
        responseTime: '< 24 hours',
        status: 'available'
    },
    {
        title: 'Phone Support',
        description: 'Speak directly with our technical experts',
        icon: Phone,
        available: 'Mon-Fri 9AM-6PM EST',
        responseTime: 'Immediate',
        status: 'business-hours'
    }
];

const commonIssues = [
    {
        title: 'Unable to send messages',
        category: 'Messaging',
        status: 'resolved',
        description: 'Messages not delivering or getting stuck in sending state'
    },
    {
        title: 'Notification not working',
        category: 'Notifications',
        status: 'investigating',
        description: 'Desktop or mobile notifications not appearing'
    },
    {
        title: 'File upload fails',
        category: 'Files',
        status: 'resolved',
        description: 'Files not uploading or upload getting stuck'
    },
    {
        title: 'Login issues',
        category: 'Authentication',
        status: 'monitoring',
        description: 'Problems logging in or staying authenticated'
    }
];

export default function Contact() {
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
        email: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting support ticket:', ticketForm);
        // Reset form or show success message
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'investigating':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'monitoring':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return <HelpCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'available':
                return 'bg-blue-500';
            case 'business-hours':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold mb-2">Support Center</h2>
                <p className="text-muted-foreground">
                    Get help from our support team or browse common issues and
                    solutions.
                </p>
            </div>

            {/* Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supportOptions.map(option => {
                    const Icon = option.icon;
                    return (
                        <Card
                            key={option.title}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Icon className="h-6 w-6" />
                                    <div
                                        className={`w-2 h-2 rounded-full ${getStatusColor(option.status)}`}
                                    />
                                </div>
                                <CardTitle className="text-lg">
                                    {option.title}
                                </CardTitle>
                                <CardDescription>
                                    {option.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Available:
                                        </span>
                                        <span className="font-medium">
                                            {option.available}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Response:
                                        </span>
                                        <span className="font-medium">
                                            {option.responseTime}
                                        </span>
                                    </div>
                                </div>
                                <Button className="w-full mt-4">
                                    Contact Support
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        System Status
                    </CardTitle>
                    <CardDescription>
                        Current status of our services and any ongoing issues
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                <div>
                                    <div className="font-medium">
                                        All Systems Operational
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Last updated: 2 minutes ago
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline">
                                <Zap className="h-3 w-3 mr-1" />
                                99.9% Uptime
                            </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
                                <div className="font-medium">Messaging</div>
                                <div className="text-muted-foreground">
                                    Operational
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
                                <div className="font-medium">File Uploads</div>
                                <div className="text-muted-foreground">
                                    Operational
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
                                <div className="font-medium">Notifications</div>
                                <div className="text-muted-foreground">
                                    Operational
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
                                <div className="font-medium">
                                    Authentication
                                </div>
                                <div className="text-muted-foreground">
                                    Operational
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Common Issues */}
            <Card>
                <CardHeader>
                    <CardTitle>Common Issues</CardTitle>
                    <CardDescription>
                        Frequently reported issues and their current status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {commonIssues.map((issue, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg border"
                            >
                                {getStatusIcon(issue.status)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">
                                            {issue.title}
                                        </h4>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {issue.category}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {issue.description}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        issue.status === 'resolved'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="capitalize"
                                >
                                    {issue.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Submit Ticket */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Submit a Support Ticket
                    </CardTitle>
                    <CardDescription>
                        Can't find what you're looking for? Send us a detailed
                        message.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={ticketForm.email}
                                    onChange={e =>
                                        setTicketForm({
                                            ...ticketForm,
                                            email: e.target.value
                                        })
                                    }
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={ticketForm.category}
                                    onValueChange={value =>
                                        setTicketForm({
                                            ...ticketForm,
                                            category: value
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">
                                            Technical Issue
                                        </SelectItem>
                                        <SelectItem value="billing">
                                            Billing Question
                                        </SelectItem>
                                        <SelectItem value="feature">
                                            Feature Request
                                        </SelectItem>
                                        <SelectItem value="account">
                                            Account Help
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={ticketForm.subject}
                                    onChange={e =>
                                        setTicketForm({
                                            ...ticketForm,
                                            subject: e.target.value
                                        })
                                    }
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={ticketForm.priority}
                                    onValueChange={value =>
                                        setTicketForm({
                                            ...ticketForm,
                                            priority: value
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                        <SelectItem value="urgent">
                                            Urgent
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={ticketForm.description}
                                onChange={e =>
                                    setTicketForm({
                                        ...ticketForm,
                                        description: e.target.value
                                    })
                                }
                                placeholder="Please provide as much detail as possible about your issue..."
                                rows={4}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Submit Ticket
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
