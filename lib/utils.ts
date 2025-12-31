import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Type-safe result wrapper for async operations
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Wraps async functions with try/catch and returns a Result type
 * @example
 * const result = await tryCatch(() => db.query.users.findFirst());
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 */
export async function tryCatch<T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as E };
  }
}

/**
 * Synchronous version of tryCatch for non-async operations
 */
export function tryCatchSync<T, E = Error>(
  fn: () => T
): Result<T, E> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as E };
  }
}

/**
 * Type guard to check if an array is a non-empty tuple
 * 
 * @param array 
 * @returns 
 */
export function isTuple<T extends any>(array: T[]): array is [T, ...T[]] {
   return array.length > 0;
}
