/**
 * Utility functions for string manipulation and formatting
 */

/**
 * Generate initials from a name or username
 * @param name - The name to generate initials from
 * @returns Two-letter initials in uppercase
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase())
    .filter((letter) => letter)
    .join("")
    .slice(0, 2);
}

/**
 * Format a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a time string for display (HH:mm format)
 * @param timeString - Time string in HH:mm format
 * @returns Formatted time string
 */
export function formatTime(timeString: string): string {
  if (!timeString || !/^\d{2}:\d{2}/.test(timeString)) {
    return timeString;
  }
  return timeString.slice(0, 5); // Return HH:mm format
}

/**
 * Validate time format
 * @param time - Time string to validate
 * @returns True if valid HH:mm format
 */
export function isValidTime(time: string): boolean {
  const timePattern = /^\d{2}:\d{2}$/;
  return timePattern.test(time);
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    return false;
  }
}
