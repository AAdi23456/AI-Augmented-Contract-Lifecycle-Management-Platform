/**
 * API configuration for the application
 */

// API Base URL - use environment variable or default to localhost:3001
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  // Contracts
  CONTRACTS: `${API_BASE_URL}/api/contracts`,
  CONTRACT_BY_ID: (id: string) => `${API_BASE_URL}/api/contracts/${id}`,
  USER_CONTRACTS: (userId: string) => `${API_BASE_URL}/api/contracts?userId=${userId}`,
  
  // Document Processing
  EXTRACT_TEXT: `${API_BASE_URL}/api/documents/extract-text`,
  SUMMARIZE_TEXT: `${API_BASE_URL}/api/documents/summarize`,
  
  // Storage
  UPLOAD_FILE: `${API_BASE_URL}/api/storage/upload`,
  SIGNED_URL: `${API_BASE_URL}/api/storage/signed-url`,
};

/**
 * Create headers with authorization token
 * @param token The authorization token
 * @returns Headers with authorization
 */
export const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

/**
 * Handle API response
 * @param response The fetch response
 * @returns The response if successful
 * @throws Error if response is not OK
 */
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `API error: ${response.status}`);
    } catch (e) {
      // If parsing fails, throw generic error with status code
      throw new Error(`API error: ${response.status}`);
    }
  }
  return response;
}

/**
 * Retry a failed API call with exponential backoff
 * @param fn The function to retry
 * @param retries The number of retries
 * @param delay The initial delay in ms
 * @returns The result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 300
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with increased delay
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

// Helper function to format API errors
export function formatApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
} 