import { decodeJwt } from 'jose';
import Cookies from 'js-cookie';

export function getJwt() {
    const token = getRawJwt();
    if (!token) {
        return undefined;
    }
    const payload = decodeJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
        return undefined;
    }

    return payload;
}

export function getRawJwt() {
    // Guard against SSR - cookies only exist in browser
    if (typeof document === 'undefined') {
        return undefined;
    }
    return Cookies.get('jwt');
}

export function clearJwt() {
    deleteCookie('jwt');
}

function deleteCookie(name: string) {
    // Guard against SSR
    if (typeof document === 'undefined') {
        return;
    }
    // CRITICAL: Must match the path used when setting the cookie
    // The server sets the cookie with path: '/', so we must remove it with path: '/'
    Cookies.remove(name, { path: '/' });
}
