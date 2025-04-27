/**
 * The values that can be represented in JSON
 */
export type JSONValue =
    | null
    | string
    | boolean
    | number
    | Array<JSONValue>
    | JSONObject;

/**
 * A JSON object. This is a map from strings to JSON values or `undefined`. We
 * allow `undefined` values as a convenience... but beware that the `undefined`
 * values do not round trip to the server. For example:
 *
 * ```
 * // Time t1
 * await tx.set('a', {a: undefined});
 *
 * // time passes, in a new transaction
 * const v = await tx.get('a');
 * console.log(v); // either {a: undefined} or {}
 * ```
 */
export type JSONObject = {
    [key: string]: JSONValue | undefined;
};

/**
 * Like {@link JSONValue} but deeply readonly
 * */
export type ReadonlyJSONValue =
    | null
    | string
    | boolean
    | number
    | ReadonlyArray<ReadonlyJSONValue>
    | ReadonlyJSONObject;

/**
 * Like {@link JSONObject} but deeply readonly
 */
export type ReadonlyJSONObject = {
    readonly [key: string]: ReadonlyJSONValue | undefined;
};

export type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'json';

export type StringColumn = {
    type: 'string';
};
export type StringColumnOptional = {
    type: 'string';
    optional: true;
};

export type NumberColumn = {
    type: 'number';
};
export type NumberColumnOptional = {
    type: 'number';
    optional: true;
};

export type BooleanColumn = {
    type: 'boolean';
};
export type BooleanColumnOptional = {
    type: 'boolean';
    optional: true;
};

export type NullColumn = { type: 'null' };
export type NullColumnOptional = { type: 'null'; optional: true };

export type JsonColumn<T extends ReadonlyJSONValue = ReadonlyJSONValue> = {
    type: 'json';
    customType: T;
};
export type JsonColumnOptional<
    T extends ReadonlyJSONValue = ReadonlyJSONValue
> = {
    type: 'json';
    optional: true;
    customType: T;
};

export type EnumColumn<T> = {
    type: 'string';
    kind: 'enum';
    customType: T;
};
export type EnumColumnOptional<T> = {
    type: 'string';
    kind: 'enum';
    optional: true;
    customType: T;
};

export type CustomColumn<T> = {
    type: ValueType;
    customType: T;
};

export type CustomColumnOptional<T> = {
    type: ValueType;
    optional: true;
    customType: T;
};

/**
 * `related` calls need to know what the available relationships are.
 * The `schema` type encodes this information.
 */
export type SchemaValue<T = unknown> =
    | StringColumn
    | StringColumnOptional
    | NumberColumn
    | NumberColumnOptional
    | BooleanColumn
    | BooleanColumnOptional
    | NullColumn
    | NullColumnOptional
    | JsonColumn
    | JsonColumnOptional
    | EnumColumn<T>
    | EnumColumnOptional<T>
    | CustomColumn<T>
    | CustomColumnOptional<T>;

export class ColumnBuilder<TShape extends SchemaValue<any>> {
    readonly #schema: TShape;

    constructor(schema: TShape) {
        this.#schema = schema;
    }

    optional() {
        return new ColumnBuilder<TShape>({
            ...this.#schema,
            optional: true
        });
    }

    get schema() {
        return this.#schema;
    }
}

export type UnwrapOptional<
    T,
    K extends keyof T,
    TOptional = true,
    TRequired = false
> = undefined extends T[K]
    ? {} extends Pick<T, K>
        ? TOptional
        : TRequired
    : TRequired;

export type Defined<T> = Exclude<T, undefined>;
export type TableSchemaBase = {
    _id: StringColumn;
    __v: NumberColumnOptional;
};
