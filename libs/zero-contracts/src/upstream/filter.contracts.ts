import type { Dict } from '../dict.js';

export type FilterOperators<T> = {
    /**
     * Matches values that are equal to the specified value.
     */
    $eq?: T;

    /**
     * Matches values that are not equal to the specified value.
     */
    $ne?: T;

    /**
     * Matches values that are greater (strict) than the specified value.
     */
    $gt?: T;

    /**
     * Matches values that are greater than or equal to the specified value.
     */
    $gte?: T;

    /**
     * Matches values that are lesser (strict) than the specified value.
     */
    $lt?: T;

    /**
     * Matches values that are lesser than or equal to the specified value.
     */
    $lte?: T;

    /**
     * Matches values that are in the specified array.
     */
    $in?: ReadonlyArray<T>;

    /**
     * Matches values that are not in the specified array.
     */
    $nin?: ReadonlyArray<T>;

    /**
     * Matches values that do NOT pass the specified condition.
     */
    $not?: T extends string ? FilterOperators<T> | RegExp : FilterOperators<T>;

    /**
     * When `true`, `$exists` matches the documents that contain the field,
     * including documents where the field value is null.
     */
    $exists?: boolean;

    /**
     * Matches values that match the specified regular expression.
     */
    $regex?: T extends string ? RegExp | string : never;

    /**
     * Options for the regular expression.
     * Only applicable if `$regex` is provided.
     */
    $options?: T extends string ? string : never;

    /**
     * Matches values that are an array containing all elements specified in the
     * array.
     */
    $all?: ReadonlyArray<any>;

    /**
     * Matches arrays with the specified length.
     */
    $size?: T extends ReadonlyArray<any> ? number : never;
};

export type RegExpOrString<T> = T extends string ? RegExp | T : T;

/**
 * It is possible to search using alternative types in mongodb e.g.
 * string types can be searched using a regex in mongo, and array types can be
 * searched using their element type
 */
export type AlternativeType<T> =
    T extends ReadonlyArray<infer U>
        ? T | RegExpOrString<U>
        : RegExpOrString<T>;

export type Condition<T> =
    | AlternativeType<T>
    | FilterOperators<AlternativeType<T>>;

export type RootFilterOperators<T> = Dict & {
    $and?: Filter<T>[];
    $or?: Filter<T>[];
};

/**
 * A MongoDB-like filter can be some portion of the table-collection schema or
 * a set of operators
 */
export type Filter<T> = RootFilterOperators<T> & {
    [K in keyof T]?: Condition<T[K]>;
};
