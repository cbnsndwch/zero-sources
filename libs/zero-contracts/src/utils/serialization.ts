/* eslint-disable @typescript-eslint/no-explicit-any */
export function bigIntReplacer(this: any, _key: string, value: any) {
    return typeof value === 'bigint' ? value.toString() : value;
}
