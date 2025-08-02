import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchHeader({ searchQuery, setSearchQuery }: SearchHeaderProps) {
  return (
    <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border border-border shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>
    </div>
  );
}
