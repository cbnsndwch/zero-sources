import type { Dict, TableMapping } from '@cbnsndwch/zero-contracts';

/**
 * Parses a Zero table's .from() modifier to extract upstream table mapping
 * configuration
 */
export function parseTableMapping<T = Dict>(
    fromModifier: string
): TableMapping<T> | null {
    try {
        const config = JSON.parse(fromModifier);

        // Validate that it has the required source field
        if (
            typeof config === 'object' &&
            config !== null &&
            typeof config.source === 'string'
        ) {
            return {
                source: config.source,
                filter: config.filter || {},
                projection: config.projection || {}
            };
        }

        return null;
    } catch (err) {
        // If it's not valid JSON, it's probably a traditional table name
        console.error(err);

        return null;
    }
}

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

    // Check if this is an inclusion projection (has any 1 values)
    const hasInclusions = projectionEntries.some(([, value]) => value === 1);

    if (hasInclusions) {
        // Inclusion projection - only include specified fields
        for (const [key, projectionSpec] of projectionEntries) {
            if (projectionSpec === 1) {
                const docValue = getNestedValue(document, key);
                if (docValue !== undefined) {
                    setNestedValue(result, key, docValue);
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
