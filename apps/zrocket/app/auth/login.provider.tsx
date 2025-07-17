import { useCallback, useSyncExternalStore } from 'react';

import { authRef } from '../zero/setup';

import { clearJwt } from './jwt';
import { LoginContext } from './use-login';

export function LoginProvider({ children }: { children: React.ReactNode }) {
    const loginState = useSyncExternalStore(
        authRef.onChange,
        useCallback(() => authRef.current, [])
    );

    return (
        <LoginContext.Provider
            value={{
                logout: () => {
                    clearJwt();
                    authRef.current = undefined;
                },
                loginState
            }}
        >
            {children}
        </LoginContext.Provider>
    );
}
