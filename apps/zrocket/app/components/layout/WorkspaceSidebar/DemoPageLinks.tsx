import { Link } from 'react-router';
import { SquarePenIcon, CopyIcon, BookOpenIcon } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from '@/components/ui/tooltip';

export default function DemoPageLinks() {
    return (
        <DropdownMenu>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <BookOpenIcon className="h-8 w-8 cursor-pointer" />
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                    className="bg-gray-800 text-white p-2 rounded"
                    side="right"
                >
                    Demo pages
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
                className="w-56 mb-2"
                side="right"
                align="start"
                alignOffset={-10}
            >
                <DropdownMenuLabel className="flex items-center gap-2">
                    <BookOpenIcon className="size-5" />
                    <div className="flex flex-col gap-1 font-medium">
                        Demo pages
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/demos/rich-message-editor">
                        <SquarePenIcon className="h-4 w-4 mr-2" />
                        Rich Message Editor
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/demos/copy-paste">
                        <CopyIcon className="h-4 w-4 mr-2" />
                        Copy & Paste
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
