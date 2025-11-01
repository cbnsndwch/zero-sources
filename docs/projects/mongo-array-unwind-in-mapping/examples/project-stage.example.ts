/**
 * Example demonstrating the $project pipeline stage
 *
 * The $project stage can be used at any point in the pipeline to:
 * - Include/exclude fields
 * - Rename fields
 * - Compute new fields
 * - Reshape documents before subsequent stages
 */

import type { TableMapping } from '@cbnsndwch/zero-contracts';
import { pipelineBuilder, project } from '@cbnsndwch/zero-contracts';

// Example 1: Using $project to include specific fields early in pipeline
// This is useful for performance - reducing document size before expensive operations
const earlyProjectionMapping: TableMapping = {
    source: 'orders',
    pipeline: [
        // First, project only needed fields (reduces data size)
        { $project: { customerId: 1, items: 1, status: 1 } },
        // Then filter (works on smaller documents)
        { $match: { status: 'pending' } },
        // Then unwind (processes less data)
        { $unwind: '$items' }
    ]
};

// Example 2: Using $project to reshape after unwinding
// Common pattern: unwind array, then project to flatten structure
const reshapeAfterUnwindMapping: TableMapping = {
    source: 'orders',
    pipeline: [
        { $match: { status: 'completed' } },
        { $unwind: '$items' },
        // Reshape the unwound document
        {
            $project: {
                orderId: '$_id',
                itemId: '$items.productId',
                itemName: '$items.name',
                quantity: '$items.quantity',
                price: '$items.price',
                totalValue: {
                    $multiply: ['$items.quantity', '$items.price']
                }
            }
        }
    ]
};

// Example 3: Using $project for intermediate transformations
// Multiple $project stages can be used for complex multi-step transformations
const multiStageProjectionMapping: TableMapping = {
    source: 'users',
    pipeline: [
        // Step 1: Extract and compute basic fields
        {
            $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                birthYear: { $year: '$birthDate' }
            }
        },
        // Step 2: Use computed fields in further calculations
        {
            $project: {
                fullName: { $concat: ['$firstName', ' ', '$lastName'] },
                email: 1,
                age: {
                    $subtract: [{ $year: new Date() }, '$birthYear']
                }
            }
        },
        // Step 3: Final shape
        {
            $project: {
                _id: 1,
                displayName: '$fullName',
                contactEmail: '$email',
                ageGroup: {
                    $switch: {
                        branches: [
                            { case: { $lt: ['$age', 18] }, then: 'minor' },
                            { case: { $lt: ['$age', 65] }, then: 'adult' },
                            { case: { $gte: ['$age', 65] }, then: 'senior' }
                        ],
                        default: 'unknown'
                    }
                }
            }
        }
    ]
};

// Example 4: Using builder API with project() helper
interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    salary: number;
    startDate: Date;
}

const builderWithProjectMapping = pipelineBuilder<IUser>('employees')
    .match({ department: 'engineering' })
    // Use $project to reshape and compute fields
    .project({
        employeeId: '$_id',
        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
        email: 1,
        yearsOfService: {
            $divide: [
                { $subtract: [new Date(), '$startDate'] },
                1000 * 60 * 60 * 24 * 365 // milliseconds in a year
            ]
        },
        salaryTier: {
            $cond: {
                if: { $gte: ['$salary', 100000] },
                then: 'senior',
                else: 'junior'
            }
        }
    })
    // Further filter based on computed fields
    .match({ yearsOfService: { $gte: 2 } })
    .build();

// Example 5: Combining $project and $addFields
// $addFields is non-destructive (keeps all fields), $project is selective
const projectVsAddFieldsMapping: TableMapping = {
    source: 'products',
    pipeline: [
        // $addFields: adds new fields, keeps all existing fields
        {
            $addFields: {
                discountedPrice: {
                    $multiply: ['$price', { $subtract: [1, '$discount'] }]
                }
            }
        },
        // $project: explicitly selects which fields to keep
        {
            $project: {
                name: 1,
                category: 1,
                originalPrice: '$price',
                discountedPrice: 1, // from $addFields above
                savings: {
                    $subtract: ['$price', '$discountedPrice']
                }
                // Note: 'price' and 'discount' are excluded (not in projection)
            }
        }
    ]
};

// Example 6: Using project() helper function
const helperFunctionExample: TableMapping = {
    source: 'accounts',
    pipeline: [
        { $match: { type: 'business' } },
        { $unwind: '$contacts' },
        // Use the project() helper for clean syntax
        project({
            accountId: '$_id',
            contactId: '$contacts.id',
            contactName: '$contacts.name',
            contactEmail: '$contacts.email',
            isPrimary: { $eq: ['$contacts.type', 'primary'] }
        })
    ]
};

export {
    earlyProjectionMapping,
    reshapeAfterUnwindMapping,
    multiStageProjectionMapping,
    builderWithProjectMapping,
    projectVsAddFieldsMapping,
    helperFunctionExample
};
