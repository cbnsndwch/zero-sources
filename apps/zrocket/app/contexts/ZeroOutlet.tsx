import { ZeroProvider as ZeroProviderBase } from '@rocicorp/zero/react';
import { Outlet } from 'react-router';

import SplashScreen from '@/components/splash';

import { useZeroRef } from '@/zero/setup';

export default function ZeroOutlet() {
    const zero = useZeroRef();

    if (!zero) {
        return <SplashScreen shouldShow />;
    }

    return (
        <ZeroProviderBase zero={zero}>
            <Outlet />
        </ZeroProviderBase>
    );
}
