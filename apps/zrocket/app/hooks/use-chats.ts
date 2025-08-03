import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useChats() {
    const zero = useZero();

    const query = zero.query.chats.orderBy('createdAt', 'desc');

    return useQuery(query, { enabled: !!zero });
}
