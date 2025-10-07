import { useQuery } from '@rocicorp/zero/react';

import { myGroups } from '@cbnsndwch/zrocket-contracts';

export default function useGroups() {
    // Context is provided by Zero framework at runtime on the server
    // For client-side, provide a minimal or undefined context if possible
    const query = myGroups(undefined);
    return useQuery(query);
}
