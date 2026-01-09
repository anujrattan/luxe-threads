/**
 * Color Utility Functions
 * 
 * Handles color name and hex code validation and conversion
 */

/**
 * Check if a string is a valid hex color code
 * Accepts formats: #FF0000, FF0000, #fff, fff
 */
export function isValidHexColor(color: string): boolean {
  const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
  return hexPattern.test(color.trim());
}

/**
 * Normalize hex color code to format #RRGGBB
 * Converts #fff to #ffffff, fff to #ffffff, etc.
 */
export function normalizeHexColor(color: string): string {
  let hex = color.trim().replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Ensure it's 6 digits
  if (hex.length === 6) {
    return `#${hex.toUpperCase()}`;
  }
  
  return color; // Return original if can't normalize
}

/**
 * Get display value for a color
 * If it's a hex code, returns normalized hex. Otherwise returns the color name.
 */
export function getColorDisplayValue(color: string): string {
  if (isValidHexColor(color)) {
    return normalizeHexColor(color);
  }
  return color;
}

/**
 * Get CSS-compatible color value
 * Returns hex code if valid, otherwise returns the color name (which might work as CSS color)
 */
export function getCssColorValue(color: string): string {
  if (isValidHexColor(color)) {
    return normalizeHexColor(color);
  }
  return color;
}

/**
 * Format color input
 * Accepts hex codes (with or without #) or color names
 */
export function formatColorInput(input: string): string {
  const trimmed = input.trim();
  
  // If it looks like a hex code, normalize it
  if (isValidHexColor(trimmed)) {
    return normalizeHexColor(trimmed);
  }
  
  // Otherwise, return as color name (capitalize first letter)
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

