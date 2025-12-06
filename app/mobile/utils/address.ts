export interface AddressFieldsValue {
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  doorNo: string;
}

export const emptyAddress: AddressFieldsValue = {
  country: '',
  state: '',
  city: '',
  neighborhood: '',
  street: '',
  buildingNo: '',
  doorNo: '',
};

export const parseAddressString = (location?: string | null): AddressFieldsValue => {
  if (!location) {
    return { ...emptyAddress };
  }

  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  const country = parts.pop() ?? '';
  const state = parts.pop() ?? '';
  const city = parts.pop() ?? '';
  const neighborhood = parts.pop() ?? '';

  const remaining = parts.pop() ?? '';
  const buildingNo = remaining?.split('/')[0]?.trim() ?? '';
  const doorNo = remaining?.split('/')[1]?.trim() ?? '';
  
  const street = parts.pop() ?? '';

  return {
    country,
    state,
    city,
    neighborhood,
    street,
    buildingNo,
    doorNo,
  };
};

export const formatAddress = (value: AddressFieldsValue): string => {
  const segments = [];
  if (value.street.trim()) {
    segments.push(value.street.trim());
  }
  const buildingSegment = [value.buildingNo.trim(), value.doorNo.trim()]
    .filter(Boolean)
    .join('/');
  if (buildingSegment) {
    segments.push(buildingSegment);
  }
  if (value.neighborhood.trim()) {
    segments.push(value.neighborhood.trim());
  }
  if (value.city.trim()) {
    segments.push(value.city.trim());
  }
  if (value.state.trim()) {
    segments.push(value.state.trim());
  } if (value.country.trim()) {
    segments.push(value.country.trim());
  }
  return segments.join(', ');
};

export const parseLocationParts = (location?: string | null): { city: string; state: string; country: string } => {
  const parsed = parseAddressString(location);
  return {
    city: parsed.city.trim(),
    state: parsed.state.trim(),
    country: parsed.country.trim(),
  };
};

export const normalizedLocationLabel = (location?: string | null): string => {
  const { city, state, country } = parseLocationParts(location);
  const label = [city, state, country]
    .filter(Boolean)
    .join(', ');
  return label || (location?.trim() ?? '');
};

export const locationMatches = (location: string, filter: string): boolean => {
  const trimmedFilter = filter.trim();
  if (!trimmedFilter) {
    return true;
  }

  const { city, state, country } = parseLocationParts(location);
  const haystack = [city, state, country, location].join(' ').toLowerCase();

  const filterTokens = trimmedFilter
    .toLowerCase()
    .split(/[\s,]+/) // allow both comma-separated and space-separated filters
    .map((token) => token.trim())
    .filter(Boolean);

  if (filterTokens.length === 0) {
    return haystack.includes(trimmedFilter.toLowerCase());
  }

  console.log("Filter Tokens:", filterTokens);
  console.log("Haystack:", haystack);

  return filterTokens.every((token) => haystack.includes(token));
};
