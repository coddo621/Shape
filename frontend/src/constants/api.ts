/**
 * API Configuration and endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const API = {
  BASE_URL: API_BASE_URL,

  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/login`,
    SIGNUP: `${API_BASE_URL}/signup`,
    LOGOUT: `${API_BASE_URL}/logout`,
    ME: `${API_BASE_URL}/me`,
    PREFERENCES: `${API_BASE_URL}/user/preferences`,
  },

  // Form endpoints
  FORMS: {
    LIST: `${API_BASE_URL}/api/forms`,
    CREATE: `${API_BASE_URL}/api/forms`,
    GET: (id: string | number) => `${API_BASE_URL}/api/forms/${id}`,
    UPDATE: (id: string | number) => `${API_BASE_URL}/api/forms/${id}`,
    DELETE: (id: string | number) => `${API_BASE_URL}/api/forms/${id}`,
    RESPONSES: (id: string | number) => `${API_BASE_URL}/api/forms/${id}/responses`,
  },

  // Response/Submission endpoints
  RESPONSES: {
    LIST: `${API_BASE_URL}/api/responses`,
     GET: (id: string | number) => `${API_BASE_URL}/api/responses/${id}`,
     UPDATE: (id: string | number) => `${API_BASE_URL}/api/responses/${id}`,
  },

  // Share endpoints
  SHARE: {
    GET: (id: string | number) => `${API_BASE_URL}/api/share/${id}`,
  },
} as const;

/**
 * Common fetch options
 */
export const FETCH_OPTIONS = {
  credentials: "include" as const,
  headers: {
    "Content-Type": "application/json",
  },
} as const;

/**
 * Helper to make API calls with consistent error handling
 */
export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...FETCH_OPTIONS,
      ...options,
      headers: {
        ...FETCH_OPTIONS.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error:
          errorData.error ||
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
