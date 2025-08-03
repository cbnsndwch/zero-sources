import { Outlet, NavLink } from 'react-router';

import { UserPreferencesLayout } from '@/components/layout/UserPreferencesLayout';

export default function PreferencesLayout() {
    return (
        <UserPreferencesLayout
            title="User Preferences"
            description="Manage your account settings and preferences"
        >
            <div className="space-y-6">
                <nav className="flex space-x-2 border-b">
                    <NavLink
                        to="/preferences"
                        end
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        Profile
                    </NavLink>
                    <NavLink
                        to="/preferences/notifications"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        Notifications
                    </NavLink>
                    <NavLink
                        to="/preferences/advanced"
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`
                        }
                    >
                        Advanced
                    </NavLink>
                </nav>
                
                <Outlet />
            </div>
        </UserPreferencesLayout>
    );
}
