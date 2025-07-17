import { createContext, useContext } from 'react';

import type { LoginState } from '../zero/setup.js';

export type LoginContext = {
    logout: () => void;
    loginState: LoginState | undefined;
};

export const LoginContext = createContext<LoginContext | undefined>(undefined);

export function useLogin(): LoginContext {
    const state = useContext(LoginContext);

    if (state === undefined) {
        throw new Error('useLogin must be used within a LoginProvider');
    }

    return state;
}
