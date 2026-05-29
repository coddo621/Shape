/**
 * Centralized color definitions for consistent styling across the application
 */

export const COLORS = {
  // Primary colors
  primary: {
    blue: "#1f4aa8",
    blueDark: "#163b87",
    lightBlue: "rgb(59, 130, 246)", // blue-500
  },

  // Semantic colors
  success: {
    light: "rgb(34, 197, 94)", // green-500
    bg: "rgb(240, 253, 244)", // green-50
    bgDark: "rgb(5, 46, 22)", // green-950
    border: "rgb(187, 247, 132)", // green-300
    borderDark: "rgb(20, 83, 45)", // green-800
    text: "rgb(22, 163, 74)", // green-600
    textDark: "rgb(134, 239, 172)", // green-300
  },

  error: {
    light: "rgb(239, 68, 68)", // red-500
    bg: "rgb(254, 242, 242)", // red-50
    bgDark: "rgb(127, 29, 29)", // red-950
    border: "rgb(254, 205, 211)", // red-200
    borderDark: "rgb(153, 27, 27)", // red-800
    text: "rgb(220, 38, 38)", // red-600
    textDark: "rgb(248, 113, 113)", // red-400
  },

  emerald: {
    bg: "rgb(240, 253, 250)", // emerald-50
    bgDark: "rgb(5, 46, 46)", // emerald-950
    border: "rgb(204, 251, 241)", // emerald-200
    borderDark: "rgb(6, 78, 59)", // emerald-800
    text: "rgb(5, 150, 105)", // emerald-600
    textDark: "rgb(110, 231, 183)", // emerald-400
  },

  rose: {
    bg: "rgb(254, 242, 242)", // rose-50
    bgDark: "rgb(76, 5, 25)", // rose-950
    border: "rgb(251, 207, 232)", // rose-200
    borderDark: "rgb(159, 18, 57)", // rose-800
    text: "rgb(190, 24, 93)", // rose-600
    textDark: "rgb(251, 113, 133)", // rose-400
  },

  // Background colors
  bg: {
    light: "rgb(241, 243, 244)", // gray-100 custom
    lightAlt: "rgb(239, 241, 244)", // custom eef1f4
    white: "#ffffff",
  },

  // Neutral/Grays
  gray: {
    50: "rgb(249, 250, 251)",
    100: "rgb(243, 244, 246)",
    200: "rgb(229, 231, 235)",
    300: "rgb(209, 213, 219)",
    400: "rgb(156, 163, 175)",
    500: "rgb(107, 114, 128)",
    600: "rgb(75, 85, 99)",
    700: "rgb(55, 65, 81)",
    800: "rgb(31, 41, 55)",
    900: "rgb(17, 24, 39)",
  },

  slate: {
    50: "rgb(248, 250, 252)",
    100: "rgb(241, 245, 249)",
    200: "rgb(226, 232, 240)",
    300: "rgb(203, 213, 225)",
    400: "rgb(148, 163, 184)",
  },

  // Border color
  border: "rgb(209, 213, 219)", // d0d7de equivalent

  // Dark mode specific
  dark: {
    bg: "oklch(1 0 0)", // background CSS var
    card: "var(--card)",
    foreground: "oklch(0.145 0 0)",
  },
} as const;

/**
 * Notification alert styles - tailwind class strings
 */
export const ALERT_STYLES = {
  success: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
    inline:
      "p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300 text-sm",
  },

  error: {
    container:
      "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100",
    inline:
      "p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm",
  },

  card: "rounded-xl border p-4 text-sm shadow-sm",
} as const;

/**
 * Card and container styles
 */
export const CONTAINER_STYLES = {
  card: "rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-8 shadow-sm",
  cardSmall: "rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 shadow-sm",
  input: "border rounded px-3 py-2 bg-white dark:bg-background text-foreground border-border",
} as const;
