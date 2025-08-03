import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useChannels() {
    const zero = useZero();

    const query = zero.query.channels.orderBy('name', 'asc');

    return useQuery(query, { enabled: !!zero });
}
