/**
 * Example: Account Members Table Mapping with Array Unwinding
 * 
 * This example demonstrates how to use the pipeline-based table mapping API
 * to normalize MongoDB documents with nested arrays into separate Zero tables.
 * 
 * Use Case: RBAC permission system where accounts have multiple members
 */

import type { TableMapping } from '@cbnsndwch/zero-contracts';
import { pipelineBuilder, match, unwind } from '@cbnsndwch/zero-contracts';

/**
 * Zero table type for account members
 */
interface IZeroAccountMember {
    _id: string;
    id: string;
    accountId: string;
    userId: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    createdAt: number;
    updatedAt: number;
}

/**
 * Zero table type for accounts
 */
interface IZeroAccount {
    _id: string;
    id: string;
    name: string;
    bundle: 'FREE' | 'PRO' | 'ENTERPRISE';
    createdAt: number;
    updatedAt: number;
}

// ============================================================================
// Example 1: Simple Array Unwinding
// ============================================================================

/**
 * Unwind all members from all accounts
 */
export const allAccountMembersMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        { $unwind: '$members' }
    ],
    projection: {
        // Composite ID: accountId + member userId
        _id: { $concat: ['$_id', '_', '$members.id'] } as any,
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] } as any,
        
        // Foreign key to parent
        accountId: '$_id',
        
        // Member fields
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        
        // Parent timestamps
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 2: Array Unwinding with Pre-Filter (Performance Optimization)
// ============================================================================

/**
 * Only unwind members from ENTERPRISE accounts
 * Filter BEFORE unwinding reduces processing
 */
export const enterpriseMembersMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        // Filter first for performance
        { $match: { bundle: 'ENTERPRISE' } },
        
        // Then unwind
        { $unwind: '$members' }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 3: Array Unwinding with Post-Filter
// ============================================================================

/**
 * Unwind members, then filter to only admins and owners
 * Filter AFTER unwinding filters unwound elements
 */
export const adminMembersMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        { $unwind: '$members' },
        
        // Filter unwound elements
        { $match: { 'members.role': { $in: ['admin', 'owner'] } } }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 4: Array Unwinding with Array Index
// ============================================================================

/**
 * Include the array index in the output
 * Useful for preserving order or detecting position
 */
export const membersWithIndexMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        {
            $unwind: {
                path: '$members',
                includeArrayIndex: 'memberIndex'
            }
        }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        memberIndex: 1, // Array index (0, 1, 2, ...)
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 5: Array Unwinding with Computed Fields
// ============================================================================

/**
 * Add computed fields using $addFields
 */
export const enrichedMembersMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        { $unwind: '$members' },
        {
            $addFields: {
                isOwner: { $eq: ['$members.role', 'owner'] },
                fullDisplayName: { $concat: ['$name', ' - ', '$members.name'] }
            }
        }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        isOwner: 1, // Computed field
        fullDisplayName: 1, // Computed field
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 6: Using Fluent Builder API
// ============================================================================

/**
 * Same as Example 3, but using the fluent builder
 * Provides better readability for complex pipelines
 */
export const adminMembersFluentMapping = pipelineBuilder<IZeroAccountMember>('accounts')
    .unwind('$members')
    .match({ 'members.role': { $in: ['admin', 'owner'] } })
    .projection({
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        createdAt: 1,
        updatedAt: 1
    })
    .build();

// ============================================================================
// Example 7: Complex Multi-Stage Pipeline
// ============================================================================

/**
 * Combine multiple stages for advanced transformations
 */
export const complexMembersMapping = pipelineBuilder<IZeroAccountMember>('accounts')
    // Filter accounts first
    .match({ 
        bundle: 'ENTERPRISE',
        isActive: true
    })
    
    // Unwind members array with index
    .unwind({ 
        path: '$members',
        includeArrayIndex: 'position'
    })
    
    // Filter unwound members
    .match({ 
        'members.role': { $in: ['admin', 'owner'] },
        'members.isActive': true
    })
    
    // Add computed fields
    .addFields({
        isOwner: { $eq: ['$members.role', 'owner'] },
        isPrimaryAdmin: { 
            $and: [
                { $eq: ['$members.role', 'admin'] },
                { $eq: ['$position', 0] }
            ]
        },
        displayName: { $concat: ['$name', ' / ', '$members.name'] }
    })
    
    // Final projection
    .projection({
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        position: 1,
        isOwner: 1,
        isPrimaryAdmin: 1,
        displayName: 1,
        createdAt: 1,
        updatedAt: 1
    })
    .build();

// ============================================================================
// Example 8: Legacy Approach (Still Supported)
// ============================================================================

/**
 * Simple filtering without array operations
 * This is the original approach and still works
 */
export const enterpriseAccountsMapping: TableMapping<IZeroAccount> = {
    source: 'accounts',
    filter: { bundle: 'ENTERPRISE' },
    projection: {
        _id: 1,
        id: { $hexToBase64Url: '$_id' },
        name: 1,
        bundle: 1,
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 9: Preserve Null and Empty Arrays
// ============================================================================

/**
 * Include accounts even if they have no members
 * Useful when you need to maintain referential integrity
 */
export const allAccountsWithOptionalMembersMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        {
            $unwind: {
                path: '$members',
                preserveNullAndEmptyArrays: true // Keep accounts with no members
            }
        }
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        createdAt: 1,
        updatedAt: 1
    }
};

// ============================================================================
// Example 10: Helper Function Usage
// ============================================================================

/**
 * Using helper functions for cleaner code
 */
export const helperExampleMapping: TableMapping<IZeroAccountMember> = {
    source: 'accounts',
    pipeline: [
        match({ bundle: 'ENTERPRISE' }),
        unwind('$members'),
        match({ 'members.role': { $in: ['admin', 'owner'] } })
    ],
    projection: {
        _id: { $concat: ['$_id', '_', '$members.id'] },
        id: { $concat: [{ $hexToBase64Url: '$_id' }, '_', '$members.id'] },
        accountId: '$_id',
        userId: '$members.id',
        name: '$members.name',
        email: '$members.email',
        role: '$members.role',
        createdAt: 1,
        updatedAt: 1
    }
};
