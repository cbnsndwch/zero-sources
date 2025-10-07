import { useQuery } from '@rocicorp/zero/react';

import { myGroups } from '@cbnsndwch/zrocket-contracts';

export default function useGroups() {
    // Context is provided by Zero framework at runtime on the server
    // Pass null as placeholder for client-side TypeScript compliance
    const query = myGroups(null as any);
    return useQuery(query);
}
