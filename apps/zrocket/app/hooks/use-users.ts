import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useUsers() {
    const zero = useZero();

    const query = zero.query.users.where('active', '=', true).orderBy('name', 'asc');

    return useQuery(query, { enabled: !!zero });
}
