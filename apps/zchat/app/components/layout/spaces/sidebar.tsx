import { useCallback, useState, type CSSProperties } from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from '@/components/ui/sidebar';

import type { SpaceSummary } from '../contracts';

import { spaces } from './data';

export default function SpacesSidebar() {
    // TODO:: move this to a zustand store / the router / the url
    const [activeItem, setActiveItem] = useState(spaces[0]);

    return (
        <Sidebar
            variant="inset"
            collapsible="icon"
            className="pt-5 pr-0 bg-transparent"
            style={{ '--sidebar': 'transparent' } as CSSProperties}
        >
            <SidebarContent className="flex flex-col items-center justify-start">
                <SidebarMenu className="gap-3 w-fit">
                    {spaces.map(item => (
                        <SpacesMenuItem
                            key={item.title}
                            item={item}
                            setActiveItem={setActiveItem}
                            activeItem={activeItem}
                        />
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}

type SpacesMenuItemProps = {
    item: SpaceSummary;
    activeItem: SpaceSummary;
    setActiveItem: (item: SpaceSummary) => void;
};

function SpacesMenuItem({ item, setActiveItem, activeItem }: SpacesMenuItemProps) {
    const { setOpen } = useSidebar();

    const onClick = useCallback(() => {
        setActiveItem(item);

        // const mail = data.mails.sort(
        //     () => Math.random() - 0.5
        // );
        // setMails(
        //     mail.slice(
        //         0,
        //         Math.max(
        //             5,
        //             Math.floor(Math.random() * 10) + 1
        //         )
        //     )
        // );
        setOpen(true);
    }, [item, setActiveItem, setOpen]);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                size="default"
                variant="outline"
                className="cursor-pointer"
                tooltip={{
                    children: item.title,
                    hidden: false
                }}
                onClick={onClick}
                isActive={activeItem.title === item.title}
            >
                <item.icon className="!h-10 !w-10" />
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
