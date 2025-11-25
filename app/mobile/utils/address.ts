export interface AddressFieldsValue {
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  doorNo: string;
}

export const emptyAddress: AddressFieldsValue = {
  city: '',
  district: '',
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

  const city = parts.pop() ?? '';
  const district = parts.pop() ?? '';
  const neighborhood = parts.pop() ?? '';
  const remaining = parts.join(', ');

  return {
    city,
    district,
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
    .join(' ');
  if (buildingSegment) {
    segments.push(buildingSegment);
  }
  if (value.neighborhood.trim()) {
    segments.push(value.neighborhood.trim());
  }
  if (value.district.trim()) {
    segments.push(value.district.trim());
  }
  if (value.city.trim()) {
    segments.push(value.city.trim());
  }
  return segments.join(', ');
};
