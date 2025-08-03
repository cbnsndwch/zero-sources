import { Outlet, NavLink } from 'react-router';

import { UserPreferencesLayout } from '@/components/layout/UserPreferencesLayout';

export default function HelpSupportLayout() {
    return (
        <UserPreferencesLayout
            title="Help & Support"
            description="Get help, learn about features, and contact support"
        >
            <div className="space-y-6">
                <nav className="flex space-x-2 border-b">
                    <NavLink
                        to="/help-support"
                        end
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        Learn
                    </NavLink>
                    <NavLink
                        to="/help-support/contact"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        Support
                    </NavLink>
                </nav>
                
                <Outlet />
            </div>
        </UserPreferencesLayout>
    );
}
