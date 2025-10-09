import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function SearchHeader({
    searchQuery,
    setSearchQuery
}: SearchHeaderProps) {
    return (
        <div className="h-12 flex items-center gap-2 px-4 bg-transparent">
            <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 py-2.5 bg-card border-muted focus:bg-background transition-colors"
                    />
                </div>
            </div>
        </div>
    );
}
