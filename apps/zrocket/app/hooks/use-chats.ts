import { useQuery } from '@rocicorp/zero/react';

import { myChats } from '@cbnsndwch/zrocket-contracts';

export default function useChats() {
    // Context is provided by Zero framework at runtime on the server
    // Pass null as placeholder for client-side TypeScript compliance
    const query = myChats(null as any);
    return useQuery(query);
}
