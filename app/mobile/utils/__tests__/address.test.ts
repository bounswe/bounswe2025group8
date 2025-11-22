import { parseAddressString, formatAddress, emptyAddress } from '../address';

describe('Address Utils', () => {
    describe('parseAddressString', () => {
        it('should return empty address for null or undefined input', () => {
            expect(parseAddressString(null)).toEqual(emptyAddress);
            expect(parseAddressString(undefined)).toEqual(emptyAddress);
            expect(parseAddressString('')).toEqual(emptyAddress);
        });

        it('should parse a full address string correctly', () => {
            // Format: Street, Neighborhood, District, City
            const input = 'Main St, Downtown, Central, Metropolis';
            const result = parseAddressString(input);

            expect(result.city).toBe('Metropolis');
            expect(result.district).toBe('Central');
            expect(result.neighborhood).toBe('Downtown');
            expect(result.street).toBe('Main St');
        });

        it('should handle partial address strings', () => {
            const input = 'Downtown, Central, Metropolis';
            const result = parseAddressString(input);

            expect(result.city).toBe('Metropolis');
            expect(result.district).toBe('Central');
            expect(result.neighborhood).toBe('Downtown');
            expect(result.street).toBe('');
        });
    });

    describe('formatAddress', () => {
        it('should format a full address object correctly', () => {
            const input = {
                city: 'Metropolis',
                district: 'Central',
                neighborhood: 'Downtown',
                street: 'Main St',
                buildingNo: '10',
                doorNo: '5',
            };

            // formatAddress logic: Street, Building Door, Neighborhood, District, City
            const expected = 'Main St, 10 5, Downtown, Central, Metropolis';
            expect(formatAddress(input)).toBe(expected);
        });

        it('should handle missing fields gracefully', () => {
            const input = {
                city: 'Metropolis',
                district: 'Central',
                neighborhood: '',
                street: '',
                buildingNo: '',
                doorNo: '',
            };

            const expected = 'Central, Metropolis';
            expect(formatAddress(input)).toBe(expected);
        });
    });
});
