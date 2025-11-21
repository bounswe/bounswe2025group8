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
  const remaining = parts.join(', ');

  return {
    country,
    state,
    city,
    neighborhood,
    street: remaining,
    buildingNo: '',
    doorNo: '',
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
