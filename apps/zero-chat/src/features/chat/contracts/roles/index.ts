import { IHasId } from '../base.contracts.js';

export type RoleScope = 'Users' | 'Subscriptions';

export type IRole = IHasId & {
    name: string;
    protected: boolean;
    description: string;
    mandatory2fa?: boolean;
    scope: RoleScope;
};
