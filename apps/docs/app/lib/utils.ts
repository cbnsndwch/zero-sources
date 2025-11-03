import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Concatenates a list of strings into a single line,
 * with a whitespace character as separator.
 *
 * @param fragments Text fragments to join
 */
export function singleLine(...fragments: string[]) {
    return fragments.join(' ');
}

/**
 * Concatenates a list of strings into a multi-line string,
 * with a line break character (`LF`) as separator.
 *
 * @param fragments Text fragments to join
 */
export function multiLine(...fragments: string[]) {
    return fragments.join('\n');
}
