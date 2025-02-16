import type { ComponentType, ReactElement, RefAttributes, SVGAttributes } from 'react';

import type { IUser } from '@cbnsndwch/zchat-contracts';

export type UserSummary = Pick<IUser, '_id' | 'username' | 'email' | 'avatarUrl'>;

export interface Team {
    name: string;
    logo: ComponentType;
    plan: string;
}

export interface BaseNavItem {
    title: string;
    badge?: string;
    icon?: ComponentType;
}

export type NavLink = BaseNavItem & {
    url: string;
    items?: never;
};

export type NavCollapsible = BaseNavItem & {
    items: (BaseNavItem & { url: string })[];
    url?: never;
};

export type NavItem = NavCollapsible | NavLink;

export interface NavGroup {
    title: string;
    items: NavItem[];
    actions?: ReactElement[]
}

export interface SidebarData {
    user: UserSummary;
    navGroups: NavGroup[];
    // teams: Team[];
}

export type SpaceSummary = {
    title: string;
    url: string;
    isActive: boolean;
    avatar?: string;
    icon: ComponentType<RefAttributes<SVGSVGElement> & SVGAttributes<unknown>>;
};
