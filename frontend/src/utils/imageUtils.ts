/**
 * Utility functions for handling image URLs
 */

/**
 * Get the full image URL, handling both relative and absolute URLs
 * @param imageUrl - The image URL from the database
 * @returns The full image URL that can be used in img src
 */
export const getImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return '';
  }

  // If it's already a full URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative URL (starts with /), use it directly (proxy will handle it)
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // If it's a relative path without leading slash, add it
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/${imageUrl}`;
};

/**
 * Check if an image URL is valid
 * @param imageUrl - The image URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export const isValidImageUrl = (imageUrl?: string | null): boolean => {
  if (!imageUrl) return false;
  
  try {
    const url = getImageUrl(imageUrl);
    return url.length > 0;
  } catch {
    return false;
  }
};

/**
 * Get a placeholder image URL for products without images
 * @returns A placeholder image URL
 */
export const getPlaceholderImageUrl = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTIwIDkwSDEwMFY1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTEwMCA1MEw4MCA5MEgxMDBWNTBaIiBmaWxsPSIjRDFENURCIi8+CjxwYXRoIGQ9Ik0xMDAgMTEwTDEyMCA3MEgxMDBWMTEwWiIgZmlsbD0iI0QxRDVEQiIvPgo8cGF0aCBkPSJNMTAwIDExMEw4MCA3MEgxMDBWMTEwWiIgZmlsbD0iI0QxRDVEQiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwIiBmaWxsPSIjRDFENURCIi8+Cjwvc3ZnPgo=';
};
