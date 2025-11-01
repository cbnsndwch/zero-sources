import { Injectable, Logger } from '@nestjs/common';

import type {
    PipelineStage,
    MatchStage,
    UnwindStage,
    SetStage,
    ProjectStage,
    UnwindOptions
} from '@cbnsndwch/zero-contracts';

import { matchesFilter, applyProjection } from '../utils/table-mapping.js';

/**
 * Service that executes pipeline stages on MongoDB documents.
 *
 * This service implements client-side execution of MongoDB aggregation pipeline
 * operations for change stream documents. It supports:
 * - $match: Filtering documents
 * - $unwind: Deconstructing array fields
 * - $addFields/$set: Adding computed fields
 * - $project: Reshaping documents
 *
 * Pipeline stages are executed sequentially, with each stage transforming
 * the document(s) for the next stage. Array unwinding can produce multiple
 * documents from a single input document.
 */
@Injectable()
export class PipelineExecutorService {
    private readonly logger = new Logger(PipelineExecutorService.name);

    /**
     * Executes a pipeline on a document, returning an array of transformed documents.
     *
     * Each pipeline stage transforms the document(s) sequentially:
     * 1. $match stages filter documents
     * 2. $unwind stages deconstruct arrays (can produce multiple documents)
     * 3. $addFields/$set stages add computed fields
     * 4. $project stages reshape documents
     *
     * @param document - The source document to process
     * @param pipeline - Array of pipeline stages to execute
     * @returns Array of transformed documents (may be empty if filtered out, or multiple if unwound)
     *
     * @example
     * ```typescript
     * const doc = {
     *   _id: '123',
     *   name: 'Account',
     *   members: [
     *     { id: 'u1', role: 'admin' },
     *     { id: 'u2', role: 'member' }
     *   ]
     * };
     *
     * const pipeline = [
     *   { $unwind: '$members' },
     *   { $match: { 'members.role': 'admin' } }
     * ];
     *
     * const results = executor.executePipeline(doc, pipeline);
     * // Returns: [{ _id: '123', name: 'Account', members: { id: 'u1', role: 'admin' } }]
     * ```
     */
    executePipeline(document: any, pipeline: PipelineStage[]): any[] {
        let documents = [document];

        for (const stage of pipeline) {
            documents = this.executeStage(documents, stage);

            // Early exit if all documents were filtered out
            if (documents.length === 0) {
                break;
            }
        }

        return documents;
    }

    /**
     * Executes a single pipeline stage on an array of documents
     */
    private executeStage(documents: any[], stage: PipelineStage): any[] {
        if ('$match' in stage) {
            return this.executeMatch(documents, stage as MatchStage);
        }
        if ('$unwind' in stage) {
            return this.executeUnwind(documents, stage as UnwindStage);
        }
        if ('$addFields' in stage) {
            return this.executeSet(documents, stage as SetStage);
        }
        if ('$project' in stage) {
            return this.executeProject(documents, stage as ProjectStage);
        }

        this.logger.warn(
            `Unknown pipeline stage: ${Object.keys(stage)[0]}. Skipping.`
        );
        return documents;
    }

    /**
     * Executes a $match stage - filters documents based on MongoDB query
     */
    private executeMatch(documents: any[], stage: MatchStage): any[] {
        return documents.filter(doc => matchesFilter(doc, stage.$match));
    }

    /**
     * Executes an $unwind stage - deconstructs array fields
     *
     * For each document:
     * - If the array path exists and has elements, creates one document per array element
     * - If the array is missing/null/empty and preserveNullAndEmptyArrays=true, keeps the document
     * - If the array is missing/null/empty and preserveNullAndEmptyArrays=false, filters it out
     * - Optionally adds array index to a specified field
     *
     * @example
     * Input: { items: ['a', 'b'] }
     * Stage: { $unwind: '$items' }
     * Output: [{ items: 'a' }, { items: 'b' }]
     *
     * @example
     * Input: { items: ['a', 'b'] }
     * Stage: { $unwind: { path: '$items', includeArrayIndex: 'idx' } }
     * Output: [{ items: 'a', idx: 0 }, { items: 'b', idx: 1 }]
     */
    private executeUnwind(documents: any[], stage: UnwindStage): any[] {
        const options: UnwindOptions<any> =
            typeof stage.$unwind === 'string' ||
            typeof stage.$unwind === 'number'
                ? { path: stage.$unwind }
                : stage.$unwind;

        const results: any[] = [];

        for (const doc of documents) {
            const pathStr = String(options.path);
            const arrayPath = pathStr.startsWith('$')
                ? pathStr.slice(1)
                : pathStr;

            const arrayValue = this.resolvePath(doc, arrayPath);

            // Handle missing, null, or empty arrays
            if (
                arrayValue === undefined ||
                arrayValue === null ||
                !Array.isArray(arrayValue) ||
                arrayValue.length === 0
            ) {
                if (options.preserveNullAndEmptyArrays) {
                    results.push({ ...doc });
                }
                continue;
            }

            // Unwind the array - create one document per element
            for (let i = 0; i < arrayValue.length; i++) {
                const unwound = { ...doc };
                this.setPath(unwound, arrayPath, arrayValue[i]);

                // Add array index if requested
                if (options.includeArrayIndex) {
                    unwound[options.includeArrayIndex] = i;
                }

                results.push(unwound);
            }
        }

        return results;
    }

    /**
     * Executes a $addFields stage - adds computed fields
     *
     * Note: MongoDB also supports $set as an alias for $addFields
     */
    private executeSet(documents: any[], stage: SetStage): any[] {
        const fields = stage.$addFields;

        return documents.map(doc => ({
            ...doc,
            ...this.computeFields(doc, fields)
        }));
    }

    /**
     * Executes a $project stage - reshapes documents
     *
     * Applies MongoDB projection specification to select, exclude, rename,
     * and compute fields in the output documents.
     */
    private executeProject(documents: any[], stage: ProjectStage): any[] {
        return documents.map(doc => applyProjection(doc, stage.$project));
    }

    /**
     * Resolves a dot-notation path in a document
     *
     * @example
     * resolvePath({ a: { b: { c: 42 } } }, 'a.b.c') // Returns: 42
     * resolvePath({ user: { name: 'John' } }, 'user.name') // Returns: 'John'
     */
    private resolvePath(obj: any, path: string): any {
        const parts = path.split('.');
        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[part];
        }

        return current;
    }

    /**
     * Sets a value at a dot-notation path in a document
     *
     * @example
     * const obj = { a: { b: {} } };
     * setPath(obj, 'a.b.c', 42);
     * // obj is now: { a: { b: { c: 42 } } }
     */
    private setPath(obj: any, path: string, value: any): void {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]!;
            if (!(part in current) || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }

        current[parts[parts.length - 1]!] = value;
    }

    /**
     * Computes field values from MongoDB expressions
     *
     * Currently supports basic field references. Will be extended to support
     * full MongoDB expression language as needed.
     *
     * @example
     * computeFields({ firstName: 'John', lastName: 'Doe' }, {
     *   fullName: { $concat: ['$firstName', ' ', '$lastName'] }
     * })
     * // Returns: { fullName: 'John Doe' }
     */
    private computeFields(doc: any, fields: Record<string, any>): any {
        const result: any = {};

        for (const [key, value] of Object.entries(fields)) {
            if (typeof value === 'string' && value.startsWith('$')) {
                // Simple field reference
                result[key] = this.resolvePath(doc, value.slice(1));
            } else if (typeof value === 'object' && value !== null) {
                // Expression - evaluate it
                result[key] = this.evaluateExpression(doc, value);
            } else {
                // Literal value
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Evaluates a MongoDB expression
     *
     * This is a simplified implementation that handles common operators.
     * Full MongoDB expression support would require a comprehensive expression evaluator.
     *
     * Supported operators:
     * - $concat: String concatenation
     * - $eq, $ne, $gt, $gte, $lt, $lte: Comparisons
     * - $add, $subtract, $multiply, $divide: Arithmetic
     * - $cond, $switch: Conditional logic
     * - Field references ($fieldName)
     *
     * @example
     * evaluateExpression({ price: 100, discount: 0.1 }, {
     *   $multiply: ['$price', { $subtract: [1, '$discount'] }]
     * })
     * // Returns: 90
     */
    private evaluateExpression(doc: any, expr: any): any {
        if (typeof expr === 'string' && expr.startsWith('$')) {
            // Field reference
            return this.resolvePath(doc, expr.slice(1));
        }

        if (Array.isArray(expr)) {
            // Array of expressions - evaluate each
            return expr.map(item => this.evaluateExpression(doc, item));
        }

        if (typeof expr !== 'object' || expr === null) {
            // Literal value
            return expr;
        }

        // Expression object - check for operators
        const keys = Object.keys(expr);
        if (keys.length === 0) {
            return expr;
        }

        const operator = keys[0]!;

        switch (operator) {
            // String operators
            case '$concat': {
                const args = this.evaluateExpression(doc, expr[operator]);
                return Array.isArray(args) ? args.join('') : '';
            }

            // Comparison operators
            case '$eq': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a === b;
            }
            case '$ne': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a !== b;
            }
            case '$gt': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a > b;
            }
            case '$gte': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a >= b;
            }
            case '$lt': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a < b;
            }
            case '$lte': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a <= b;
            }

            // Arithmetic operators
            case '$add': {
                const args = this.evaluateExpression(doc, expr[operator]);
                return Array.isArray(args)
                    ? args.reduce((sum, val) => sum + val, 0)
                    : 0;
            }
            case '$subtract': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return a - b;
            }
            case '$multiply': {
                const args = this.evaluateExpression(doc, expr[operator]);
                return Array.isArray(args)
                    ? args.reduce((product, val) => product * val, 1)
                    : 1;
            }
            case '$divide': {
                const [a, b] = this.evaluateExpression(doc, expr[operator]);
                return b !== 0 ? a / b : null;
            }

            // Conditional operators
            case '$cond': {
                const condition = expr[operator];
                const ifValue = this.evaluateExpression(doc, condition.if);
                const thenValue = this.evaluateExpression(doc, condition.then);
                const elseValue = this.evaluateExpression(doc, condition.else);
                return ifValue ? thenValue : elseValue;
            }

            default:
                this.logger.warn(
                    `Unsupported expression operator: ${operator}. Returning null.`
                );
                return null;
        }
    }
}

export const PIPELINE_EXECUTOR_SERVICE_TOKEN = Symbol(
    PipelineExecutorService.name
);
