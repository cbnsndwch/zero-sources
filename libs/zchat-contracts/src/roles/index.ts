import { IHasId } from '../common/index.js';

export const ROLE_SUPER_ADMIN = 'superadmin';

export type RoleScope = 'Users' | 'Subscriptions';

export type IRole = IHasId & {
    name: string;
    protected: boolean;
    description: string;
    mandatory2fa?: boolean;
    scope: RoleScope;
};
