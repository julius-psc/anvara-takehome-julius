// Utility helpers for the API

// Helper to safely extract a route/query param as a string.
// NOTE: falls back to '' when the value is missing or not a string.
export function getParam(param: unknown): string {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return '';
}

// Helper to format currency values
export function formatCurrency(amount: number, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
}

// Helper to calculate percentage change
export function calculatePercentChange(oldValue: number, newValue: number) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Parse pagination params from query
export function parsePagination(query: Record<string, string>) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to build a filter object from query params
export const buildFilters = (query: Record<string, string>, allowedFields: string[]) => {
  const filters: Record<string, string> = {};

  for (const field of allowedFields) {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }
  }

  return filters;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DEPRECATED_CONFIG = {
  apiVersion: 'v1',
  timeout: 5000,
};

// Clamp a number into the [min, max] range.
export function clampValue(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// Format a date for display.
// NOTE: does not guard against invalid dates.
export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString();
}
