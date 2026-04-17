/**
 * Formats a number with dot as thousands separator (ID style)
 * @param value Number or string to format
 * @returns Formatted string (e.g., 100.000)
 */
export const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Strips non-numeric characters from a string (useful for inputs)
 * @param value Formatted string
 * @returns Clean numeric string
 */
export const cleanNumericValue = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Handles live input formatting for currency
 * @param value Current input value
 * @returns Formatted string with dots
 */
export const formatInputCurrency = (value: string): string => {
  const clean = cleanNumericValue(value);
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(clean, 10));
};
