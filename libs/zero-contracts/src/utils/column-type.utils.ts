import type { ValueType } from '@rocicorp/zero';

/**
 * HACK: map zero schema column types to pg types so zero cache is happy
 */
export const ZERO_VALUE_TYPE_TO_PG_TYPE: Record<ValueType, string> = {
    string: 'text',
    number: 'float8',
    boolean: 'boolean',
    json: 'json',
    null: 'text'
};
