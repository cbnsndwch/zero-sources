import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useGroup(id: string) {
    const zero = useZero();

    return useQuery(
        zero.query.groups
            .where('_id', '=', id)
            .one()
            .related('textMessages')
            .related('systemMessages')
            .related('imageMessages')
    );
}

export type GroupWithMessages = ReturnType<typeof useGroup>[0];
