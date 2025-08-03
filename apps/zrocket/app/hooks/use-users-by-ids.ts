import { useMemo } from 'react';
import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useUsersByIds(userIds: string[]) {
    const zero = useZero();

    // For now, get all users and filter client-side
    // TODO: Update when Zero supports 'in' operator
    const query = zero.query.users;

    const [allUsers] = useQuery(query, { enabled: !!zero });

    const users = useMemo(() => {
        if (!allUsers || userIds.length === 0) return [];
        return allUsers.filter(user => userIds.includes(user._id));
    }, [allUsers, userIds]);

    const usersMap = useMemo(() => {
        const map = new Map();
        users?.forEach(user => {
            map.set(user._id, user);
        });
        return map;
    }, [users]);

    return usersMap;
}
