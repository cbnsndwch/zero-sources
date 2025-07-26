import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useChannel(id: string) {
    const zero = useZero();

    return useQuery(
        zero.query.channels
            .where('_id', '=', id)
            .one()
            .related('textMessages')
            .related('systemMessages')
            .related('imageMessages')
    );
}

export type ChannelWithMessages = ReturnType<typeof useChannel>[0];