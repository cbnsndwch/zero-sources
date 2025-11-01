import { Injectable } from '@nestjs/common';

/**
 * Dependency injection token for ArrayDiffService
 */
export const ARRAY_DIFF_SERVICE_TOKEN = Symbol('ARRAY_DIFF_SERVICE');

/**
 * Options for array diff computation
 */
export interface ArrayDiffOptions {
  /**
   * Field to use for element identity matching (e.g., '_id', 'memberId')
   * When provided, elements are matched by this field value rather than by index
   * This provides stable matching even when arrays are reordered
   */
  identityField?: string;

  /**
   * Whether to fall back to index-based comparison if identity matching fails
   * Default: false
   */
  fallbackToIndex?: boolean;
}

/**
 * Result of array diff computation
 */
export interface ArrayDiff {
  /** Elements that were added to the array */
  added: Array<{ index: number; value: any }>;

  /** Elements that were removed from the array */
  removed: Array<{ index: number; value: any }>;

  /** Elements that were modified (value changed but identity same) */
  modified: Array<{ index: number; oldValue: any; newValue: any }>;
}

/**
 * Service for computing differences between arrays
 *
 * Supports two comparison strategies:
 * 1. Identity-based: Match elements by a designated field (e.g., _id)
 * 2. Index-based: Match elements by position in array
 */
@Injectable()
export class ArrayDiffService {
  /**
   * Computes the difference between two arrays
   *
   * @param oldArray - The original array (before changes)
   * @param newArray - The updated array (after changes)
   * @param options - Diff computation options
   * @returns Diff containing added, removed, and modified elements
   */
  computeDiff(
    oldArray: any[] | undefined | null,
    newArray: any[] | undefined | null,
    options?: ArrayDiffOptions
  ): ArrayDiff {
    const old = oldArray ?? [];
    const newArr = newArray ?? [];

    // If no identity field, use index-based comparison
    if (!options?.identityField) {
      return this.indexBasedDiff(old, newArr);
    }

    // Use identity field for stable comparison
    return this.identityBasedDiff(old, newArr, options.identityField);
  }

  /**
   * Performs index-based diff (match by position)
   *
   * Simple comparison where elements at the same index are compared.
   * Works well for ordered arrays but treats reordering as modifications.
   */
  private indexBasedDiff(oldArray: any[], newArray: any[]): ArrayDiff {
    const added: ArrayDiff['added'] = [];
    const removed: ArrayDiff['removed'] = [];
    const modified: ArrayDiff['modified'] = [];

    const maxLength = Math.max(oldArray.length, newArray.length);

    for (let i = 0; i < maxLength; i++) {
      if (i >= oldArray.length) {
        // New array is longer - elements were added
        added.push({ index: i, value: newArray[i] });
      } else if (i >= newArray.length) {
        // Old array was longer - elements were removed
        removed.push({ index: i, value: oldArray[i] });
      } else if (!this.deepEqual(oldArray[i], newArray[i])) {
        // Element at this position changed
        modified.push({
          index: i,
          oldValue: oldArray[i],
          newValue: newArray[i],
        });
      }
    }

    return { added, removed, modified };
  }

  /**
   * Performs identity-based diff (match by designated field)
   *
   * Matches elements by a unique identifier field (e.g., _id, memberId).
   * Handles reordering gracefully - only actual data changes are detected.
   *
   * @param oldArray - Original array
   * @param newArray - Updated array
   * @param identityField - Field name to use for matching elements
   */
  private identityBasedDiff(
    oldArray: any[],
    newArray: any[],
    identityField: string
  ): ArrayDiff {
    const added: ArrayDiff['added'] = [];
    const removed: ArrayDiff['removed'] = [];
    const modified: ArrayDiff['modified'] = [];

    // Create maps for efficient lookup by identity value
    const oldMap = new Map(
      oldArray.map((item, index) => [
        this.getIdentityValue(item, identityField),
        { item, index },
      ])
    );
    const newMap = new Map(
      newArray.map((item, index) => [
        this.getIdentityValue(item, identityField),
        { item, index },
      ])
    );

    // Find added and modified elements
    for (const [id, { item: newItem, index: newIndex }] of newMap) {
      const old = oldMap.get(id);

      if (!old) {
        // Element with this identity doesn't exist in old array - added
        added.push({ index: newIndex, value: newItem });
      } else if (!this.deepEqual(old.item, newItem)) {
        // Element exists but content changed - modified
        modified.push({
          index: newIndex,
          oldValue: old.item,
          newValue: newItem,
        });
      }
      // else: Element unchanged (not reported)
    }

    // Find removed elements
    for (const [id, { item: oldItem, index: oldIndex }] of oldMap) {
      if (!newMap.has(id)) {
        // Element with this identity no longer exists in new array - removed
        removed.push({ index: oldIndex, value: oldItem });
      }
    }

    return { added, removed, modified };
  }

  /**
   * Extracts the identity value from an element
   *
   * @param item - The array element
   * @param identityField - Field name to extract (supports dot notation)
   * @returns The identity value
   */
  private getIdentityValue(item: any, identityField: string): any {
    if (!item || typeof item !== 'object') {
      return undefined;
    }

    // Support dot notation (e.g., 'user.id')
    const parts = identityField.split('.');
    let value = item;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Deep equality comparison between two values
   *
   * @param a - First value
   * @param b - Second value
   * @returns True if values are deeply equal
   */
  private deepEqual(a: any, b: any): boolean {
    // Fast path for primitives and references
    if (a === b) return true;

    // Handle null/undefined
    if (a == null || b == null) return false;

    // Handle different types
    if (typeof a !== typeof b) return false;

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.deepEqual(item, b[index]));
    }

    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every((key) => this.deepEqual(a[key], b[key]));
    }

    // Fallback to strict equality
    return a === b;
  }
}
