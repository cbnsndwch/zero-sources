/**
 * Checks if a document matches the filter criteria
 */
export function matchesFilter(document: any, filter: object): boolean {
    if (!filter || Object.keys(filter).length === 0) {
        return true;
    }

    for (const [key, value] of Object.entries(filter)) {
        if (!evaluateFilterCondition(document, key, value)) {
            return false;
        }
    }

    return true;
}

/**
 * Evaluates a single filter condition against a document
 */
function evaluateFilterCondition(
    document: any,
    key: string,
    value: any
): boolean {
    const docValue = getNestedValue(document, key);

    // Handle MongoDB operators
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [operator, operatorValue] of Object.entries(value)) {
            switch (operator) {
                case '$eq':
                    return docValue === operatorValue;
                case '$ne':
                    return docValue !== operatorValue;
                case '$in':
                    return (
                        Array.isArray(operatorValue) &&
                        operatorValue.includes(docValue)
                    );
                case '$nin':
                    return (
                        Array.isArray(operatorValue) &&
                        !operatorValue.includes(docValue)
                    );
                case '$gt':
                    return (
                        typeof operatorValue === 'number' &&
                        typeof docValue === 'number' &&
                        docValue > operatorValue
                    );
                case '$gte':
                    return (
                        typeof operatorValue === 'number' &&
                        typeof docValue === 'number' &&
                        docValue >= operatorValue
                    );
                case '$lt':
                    return (
                        typeof operatorValue === 'number' &&
                        typeof docValue === 'number' &&
                        docValue < operatorValue
                    );
                case '$lte':
                    return (
                        typeof operatorValue === 'number' &&
                        typeof docValue === 'number' &&
                        docValue <= operatorValue
                    );
                case '$exists':
                    return operatorValue
                        ? docValue !== undefined
                        : docValue === undefined;
                case '$regex':
                    return (
                        typeof operatorValue === 'string' &&
                        new RegExp(operatorValue).test(String(docValue))
                    );
                default:
                    // Unsupported operator, return false for safety
                    return false;
            }
        }
    }

    // Direct value comparison
    return docValue === value;
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
    if (!path || !path.trim().length) {
        return obj;
    }

    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

/**
 * Resolves a document path (must start with $) to its value in the document.
 * Throws an error if the path doesn't start with $.
 */
function resolveValue(document: any, path: any): any {
    if (typeof path !== 'string') {
        throw new Error('Document path must be a string');
    }

    if (!path.startsWith('$')) {
        throw new Error(`Document path must start with $, got: ${path}`);
    }

    // Remove the $ prefix and get the nested value
    const fieldPath = path.substring(1);
    return getNestedValue(document, fieldPath);
}

/**
 * Applies a MongoDB-like projection to a document
 *
 * TODO: add support for field renaming
 */
export function applyProjection(document: any, projection: object): any {
    if (!projection || Object.keys(projection).length === 0) {
        return { ...document };
    }

    let result: any = {};
    const projectionEntries = Object.entries(projection);

    // Check if this is an inclusion projection (has any 1 values or projection operators)
    const hasInclusions = projectionEntries.some(
        ([, value]) =>
            value === 1 || (typeof value === 'object' && value !== null)
    );

    if (hasInclusions) {
        // Inclusion projection - only include specified fields
        for (const [key, projectionSpec] of projectionEntries) {
            if (projectionSpec === 1) {
                const docValue = getNestedValue(document, key);
                if (docValue !== undefined) {
                    setNestedValue(result, key, docValue);
                }
            } else if (
                typeof projectionSpec === 'object' &&
                projectionSpec !== null
            ) {
                // Handle projection operators (e.g., $toString, $toInt, etc.)
                const transformedValue = applyProjectionOperators(
                    document,
                    projectionSpec
                );
                if (transformedValue !== undefined) {
                    setNestedValue(result, key, transformedValue);
                }
            }
        }

        // Always include _id unless explicitly excluded
        if (
            document._id !== undefined &&
            !projectionEntries.some(
                ([key, value]) => key === '_id' && value === 0
            )
        ) {
            result._id = document._id;
        }
    } else {
        // Exclusion projection - include all except specified fields
        result = { ...document };
        for (const [key, value] of projectionEntries) {
            if (value === 0) {
                deleteNestedValue(result, key);
            }
        }
    }

    return result;
}

/**
 * Applies projection operators to transform field values
 */
function applyProjectionOperators(document: any, projectionSpec: any): any {
    // Handle single operator
    for (const [operator, operand] of Object.entries(projectionSpec)) {
        switch (operator) {
            case '$toString':
                return convertToString(document, operand as string);
            case '$toInt':
                return convertToInt(document, operand as string);
            case '$toLong':
                return convertToLong(document, operand as string);
            case '$toDouble':
                return convertToDouble(document, operand as string);
            case '$toBool':
                return convertToBool(document, operand as string);
            case '$toDate':
                return convertToDate(document, operand as string);
            case '$toObjectId':
                return convertToObjectId(document, operand as string);
            case '$type':
                return getType(document, operand as string);
            case '$convert':
                return convertWithOptions(document, operand);
            case '$hexToBase64Url':
                return convertHexToBase64Url(document, operand as string);
            default:
                // Unsupported operator, return undefined
                return undefined;
        }
    }
    return undefined;
}

/**
 * Converts a value to string
 */
function convertToString(
    document: any,
    documentPath: string
): string | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) return undefined;
    if (value instanceof Date) return value.toISOString();
    return String(value);
}

/**
 * Converts a value to integer
 */
function convertToInt(document: any, documentPath: string): number | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number') return Math.trunc(value);
    if (value instanceof Date) return Math.trunc(value.getTime());
    return undefined;
}

/**
 * Converts a value to long (treating as number in JavaScript)
 */
function convertToLong(
    document: any,
    documentPath: string
): number | undefined {
    return convertToInt(document, documentPath);
}

/**
 * Converts a value to double
 */
function convertToDouble(
    document: any,
    documentPath: string
): number | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value ? 1.0 : 0.0;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number') return value;
    if (value instanceof Date) return value.getTime();
    return undefined;
}

/**
 * Converts a value to boolean
 */
function convertToBool(
    document: any,
    documentPath: string
): boolean | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (value instanceof Date) return true;
    return Boolean(value);
}

/**
 * Converts a value to Date
 */
function convertToDate(document: any, documentPath: string): Date | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
}

/**
 * Converts a value to ObjectId (returns string representation)
 */
function convertToObjectId(
    document: any,
    documentPath: string
): string | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) return undefined;
    // If it's already an ObjectId-like object, return its string representation
    if (typeof value === 'object' && 'toString' in value) {
        return String(value);
    }
    return String(value);
}

/**
 * Returns the BSON type of a value as a string
 */
function getType(document: any, documentPath: string): string | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'int' : 'double';
    }
    if (typeof value === 'boolean') return 'bool';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
}

/**
 * Converts a hex string to URL-safe base64 string
 */
function convertHexToBase64Url(
    document: any,
    documentPath: string
): string | undefined {
    const value = resolveValue(document, documentPath);
    if (value === null || value === undefined) {
        return undefined;
    }

    let hexString: string;

    // Handle ObjectId objects with toString method
    if (typeof value === 'object' && 'toString' in value) {
        hexString = String(value);
    } else if (typeof value === 'string') {
        hexString = value;
    } else {
        return undefined;
    }

    // Remove any whitespace or common prefixes
    hexString = hexString.trim().replace(/^0x/i, '');

    // Validate hex string (should only contain hex characters)
    if (!/^[0-9a-f]+$/i.test(hexString)) {
        return undefined;
    }

    // Ensure even length (hex strings should have pairs of characters)
    if (hexString.length % 2 !== 0) {
        return undefined;
    }

    try {
        // Convert hex to base64url
        const buffer = Buffer.from(hexString, 'hex');
        return buffer.toString('base64url');
    } catch {
        return undefined;
    }
}

/**
 * Converts a value with additional options (error handling, default values)
 */
function convertWithOptions(document: any, options: any): any {
    if (!options || typeof options !== 'object') return undefined;

    const { input, to, onError, onNull } = options;
    const value = resolveValue(document, input);

    if (value === null && onNull !== undefined) {
        return onNull;
    }

    if (value === null || value === undefined) return undefined;

    try {
        switch (to) {
            case 'string':
                return String(value);
            case 'int':
            case 'long': {
                const intVal =
                    typeof value === 'string'
                        ? parseInt(value, 10)
                        : Math.trunc(Number(value));
                if (isNaN(intVal)) throw new Error('Conversion failed');
                return intVal;
            }
            case 'double':
            case 'decimal': {
                const doubleVal = parseFloat(String(value));
                if (isNaN(doubleVal)) throw new Error('Conversion failed');
                return doubleVal;
            }
            case 'bool':
                return Boolean(value);
            case 'date': {
                const date = new Date(value);
                if (isNaN(date.getTime())) throw new Error('Conversion failed');
                return date;
            }
            case 'objectId':
                return String(value);
            default:
                return undefined;
        }
    } catch {
        return onError !== undefined ? onError : undefined;
    }
}

/**
 * Sets a nested value in an object using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!key) continue;

        if (
            !(key in current) ||
            typeof current[key] !== 'object' ||
            current[key] === null
        ) {
            current[key] = {};
        }
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
        current[lastKey] = value;
    }
}

/**
 * Deletes a nested value from an object using dot notation
 */
function deleteNestedValue(obj: any, path: string): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!key) continue;

        if (
            !(key in current) ||
            typeof current[key] !== 'object' ||
            current[key] === null
        ) {
            return;
        }
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
        delete current[lastKey];
    }
}
