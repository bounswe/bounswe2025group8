import { API_ORIGIN } from '../services/api';

export const toAbsoluteUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  try {
    // If already absolute, this will parse fine and keep as-is
    const url = new URL(value, API_ORIGIN);
    return url.toString();
  } catch {
    // Fallback: prefix with API origin if it's a relative path
    if (value.startsWith('/')) {
      return `${API_ORIGIN}${value}`;
    }
    return value;
  }
};

export default {
  toAbsoluteUrl,
};

