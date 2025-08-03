import { useZero } from '@/zero/use-zero';

export default function useCurrentUser() {
    const zero = useZero();

    return zero?.userID || null;
}
