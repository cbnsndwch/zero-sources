import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useGroups() {
    const zero = useZero();

    const query = zero.query.groups.orderBy('name', 'asc');

    return useQuery(query, { enabled: !!zero });
}
