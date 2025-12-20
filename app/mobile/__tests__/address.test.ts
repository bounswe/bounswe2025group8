/**
 * Unit Tests for Address Utility Functions
 * Tests the actual address.ts utility functions
 */

import {
    parseAddressString,
    formatAddress,
    parseLocationParts,
    normalizedLocationLabel,
    locationMatches,
    emptyAddress,
    AddressFieldsValue,
} from '../utils/address';

describe('Address Utilities', () => {
    describe('emptyAddress', () => {
        test('has all empty fields', () => {
            expect(emptyAddress.country).toBe('');
            expect(emptyAddress.state).toBe('');
            expect(emptyAddress.city).toBe('');
            expect(emptyAddress.neighborhood).toBe('');
            expect(emptyAddress.street).toBe('');
            expect(emptyAddress.buildingNo).toBe('');
            expect(emptyAddress.doorNo).toBe('');
        });
    });

    describe('parseAddressString', () => {
        test('parses full address correctly', () => {
            const location = 'Main Street, 42/3B, Moda, Kadikoy, Istanbul, Turkey';
            const result = parseAddressString(location);

            expect(result.country).toBe('Turkey');
            expect(result.state).toBe('Istanbul');
            expect(result.city).toBe('Kadikoy');
            expect(result.neighborhood).toBe('Moda');
        });

        test('parses simple address', () => {
            const location = 'Istanbul, Turkey';
            const result = parseAddressString(location);

            expect(result.country).toBe('Turkey');
            expect(result.state).toBe('Istanbul');
        });

        test('returns empty address for null', () => {
            const result = parseAddressString(null);
            expect(result).toEqual(emptyAddress);
        });

        test('returns empty address for undefined', () => {
            const result = parseAddressString(undefined);
            expect(result).toEqual(emptyAddress);
        });

        test('returns empty address for empty string', () => {
            const result = parseAddressString('');
            expect(result).toEqual(emptyAddress);
        });

        test('parses address with building number and door', () => {
            const location = 'Street Name, 15/4A, Neighborhood, City, State, Country';
            const result = parseAddressString(location);

            expect(result.buildingNo).toBe('15');
            expect(result.doorNo).toBe('4A');
        });
    });

    describe('formatAddress', () => {
        test('formats complete address', () => {
            const address: AddressFieldsValue = {
                country: 'Turkey',
                state: 'Istanbul',
                city: 'Kadikoy',
                neighborhood: 'Moda',
                street: 'Main Street',
                buildingNo: '42',
                doorNo: '3B',
            };
            const result = formatAddress(address);

            expect(result).toContain('Turkey');
            expect(result).toContain('Istanbul');
            expect(result).toContain('Kadikoy');
            expect(result).toContain('Moda');
            expect(result).toContain('Main Street');
            expect(result).toContain('42/3B');
        });

        test('formats address without building info', () => {
            const address: AddressFieldsValue = {
                country: 'Turkey',
                state: 'Istanbul',
                city: 'Kadikoy',
                neighborhood: '',
                street: '',
                buildingNo: '',
                doorNo: '',
            };
            const result = formatAddress(address);

            expect(result).toBe('Kadikoy, Istanbul, Turkey');
        });

        test('formats minimal address', () => {
            const address: AddressFieldsValue = {
                country: 'Turkey',
                state: '',
                city: '',
                neighborhood: '',
                street: '',
                buildingNo: '',
                doorNo: '',
            };
            const result = formatAddress(address);

            expect(result).toBe('Turkey');
        });

        test('formats empty address', () => {
            const result = formatAddress(emptyAddress);
            expect(result).toBe('');
        });

        test('handles building number only (no door)', () => {
            const address: AddressFieldsValue = {
                country: 'Turkey',
                state: '',
                city: 'Istanbul',
                neighborhood: '',
                street: '',
                buildingNo: '42',
                doorNo: '',
            };
            const result = formatAddress(address);

            expect(result).toContain('42');
            expect(result).not.toContain('/');
        });
    });

    describe('parseLocationParts', () => {
        test('extracts city, state, country', () => {
            const location = 'Neighborhood, City, State, Country';
            const result = parseLocationParts(location);

            expect(result.city).toBe('City');
            expect(result.state).toBe('State');
            expect(result.country).toBe('Country');
        });

        test('handles null location', () => {
            const result = parseLocationParts(null);
            expect(result.city).toBe('');
            expect(result.state).toBe('');
            expect(result.country).toBe('');
        });

        test('handles simple location', () => {
            const result = parseLocationParts('Turkey');
            expect(result.country).toBe('Turkey');
        });
    });

    describe('normalizedLocationLabel', () => {
        test('creates comma-separated label', () => {
            const location = 'Neighborhood, Kadikoy, Istanbul, Turkey';
            const result = normalizedLocationLabel(location);

            expect(result).toContain('Kadikoy');
            expect(result).toContain('Istanbul');
            expect(result).toContain('Turkey');
        });

        test('handles empty location', () => {
            const result = normalizedLocationLabel('');
            expect(result).toBe('');
        });

        test('handles null location', () => {
            const result = normalizedLocationLabel(null);
            expect(result).toBe('');
        });

        test('returns original location if parsing fails', () => {
            const location = 'Simple Location';
            const result = normalizedLocationLabel(location);
            // Should return something (either parsed or original)
            expect(typeof result).toBe('string');
        });
    });

    describe('locationMatches', () => {
        test('matches on city', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'Kadikoy')).toBe(true);
        });

        test('matches on country', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'Turkey')).toBe(true);
        });

        test('matches case insensitively', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'istanbul')).toBe(true);
            expect(locationMatches(location, 'TURKEY')).toBe(true);
        });

        test('matches multiple tokens', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'Istanbul Turkey')).toBe(true);
        });

        test('matches comma-separated filter', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'Istanbul, Turkey')).toBe(true);
        });

        test('returns true for empty filter', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, '')).toBe(true);
            expect(locationMatches(location, '   ')).toBe(true);
        });

        test('returns false for non-matching filter', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'Berlin')).toBe(false);
        });

        test('handles partial matches', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'istan')).toBe(true); // partial of Istanbul
        });

        test('requires all tokens to match', () => {
            const location = 'Moda, Kadikoy, Istanbul, Turkey';
            expect(locationMatches(location, 'Istanbul Berlin')).toBe(false);
        });
    });
});
