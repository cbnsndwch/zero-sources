import type { CSSProperties } from 'react';
import { Outlet } from 'react-router';

import SpacesSidebar from './spaces/sidebar';

import { AppSidebar } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';


export default function SidebarLayout() {
    return (
        <SidebarProvider
            open={false}
            style={
                {
                    '--sidebar-width': '4rem'
                    // '--sidebar-width-icon': '0'
                } as CSSProperties
            }
            // className="bg-purple-200"
            className="!bg-transparent"
        >
            <SpacesSidebar />

            <SidebarInset
                className="mx-0 bg-white grow overflow-hidden !rounded-md"
                style={
                    {
                        '--sidebar-width-icon': '3rem'
                    } as CSSProperties
                }
            >
                <div className="h-full flex justify-start items-stretch">
                    <AppSidebar />
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
