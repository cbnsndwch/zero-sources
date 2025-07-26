import { useQuery } from '@rocicorp/zero/react';

import { useZero } from '@/zero/use-zero';

export default function useChat(id: string) {
    const zero = useZero();

    return useQuery(
        zero.query.chats
            .where('_id', '=', id)
            .one()
            .related('textMessages')
            .related('systemMessages')
            .related('imageMessages')
    );
}

export type ChatWithMessages = ReturnType<typeof useChat>[0];