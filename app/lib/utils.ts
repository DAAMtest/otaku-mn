/**
 * Utility functions for the application
 */

/**
 * Combines multiple className strings, removing duplicates and handling conditionals
 * Simplified version without tailwind-merge for mobile-only development
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
