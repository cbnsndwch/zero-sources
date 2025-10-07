import { useQuery } from '@rocicorp/zero/react';

import { publicChannels } from '@cbnsndwch/zrocket-contracts';

export default function useChannels() {
    return useQuery(publicChannels());
}
