/**
 * Unit Tests for Location and Address Utilities
 * Tests address formatting, parsing, and location-related logic
 */

describe('Address Formatting Utilities', () => {
    describe('formatFullAddress', () => {
        const formatFullAddress = (address: {
            country?: string;
            state?: string;
            city?: string;
            neighborhood?: string;
            street?: string;
            building?: string;
            door?: string;
        }): string => {
            const parts = [
                address.door && `No: ${address.door}`,
                address.building && `Building: ${address.building}`,
                address.street,
                address.neighborhood,
                address.city,
                address.state,
                address.country,
            ].filter(Boolean);
            return parts.join(', ') || 'No address provided';
        };

        test('formats complete address', () => {
            const address = {
                country: 'Turkey',
                state: 'Istanbul',
                city: 'Kadikoy',
                neighborhood: 'Moda',
                street: 'Main Street',
                building: '42',
                door: '3B',
            };
            const result = formatFullAddress(address);
            expect(result).toContain('No: 3B');
            expect(result).toContain('Building: 42');
            expect(result).toContain('Moda');
            expect(result).toContain('Turkey');
        });

        test('handles partial address', () => {
            const address = { city: 'Istanbul', country: 'Turkey' };
            const result = formatFullAddress(address);
            expect(result).toBe('Istanbul, Turkey');
        });

        test('returns default for empty address', () => {
            expect(formatFullAddress({})).toBe('No address provided');
        });
    });

    describe('formatShortAddress', () => {
        const formatShortAddress = (address: {
            city?: string;
            state?: string;
            country?: string;
        }): string => {
            if (address.city && address.country) {
                return `${address.city}, ${address.country}`;
            }
            if (address.state && address.country) {
                return `${address.state}, ${address.country}`;
            }
            return address.country || 'Unknown location';
        };

        test('returns city and country', () => {
            expect(formatShortAddress({ city: 'Istanbul', country: 'Turkey' })).toBe('Istanbul, Turkey');
        });

        test('falls back to state and country', () => {
            expect(formatShortAddress({ state: 'California', country: 'USA' })).toBe('California, USA');
        });

        test('falls back to country only', () => {
            expect(formatShortAddress({ country: 'Germany' })).toBe('Germany');
        });

        test('returns Unknown for empty', () => {
            expect(formatShortAddress({})).toBe('Unknown location');
        });
    });

    describe('parseLocationString', () => {
        const parseLocationString = (location: string): {
            city?: string;
            country?: string;
        } => {
            if (!location) return {};
            const parts = location.split(',').map(p => p.trim());
            if (parts.length >= 2) {
                return {
                    city: parts[0],
                    country: parts[parts.length - 1],
                };
            }
            return { country: parts[0] };
        };

        test('parses city, country format', () => {
            const result = parseLocationString('Istanbul, Turkey');
            expect(result.city).toBe('Istanbul');
            expect(result.country).toBe('Turkey');
        });

        test('parses multiple parts', () => {
            const result = parseLocationString('Moda, Kadikoy, Istanbul, Turkey');
            expect(result.city).toBe('Moda');
            expect(result.country).toBe('Turkey');
        });

        test('handles single value', () => {
            const result = parseLocationString('Turkey');
            expect(result.country).toBe('Turkey');
            expect(result.city).toBeUndefined();
        });

        test('handles empty string', () => {
            expect(parseLocationString('')).toEqual({});
        });
    });
});

describe('Distance and Location Utilities', () => {
    describe('calculateDistance', () => {
        // Haversine formula for distance between two points
        const calculateDistance = (
            lat1: number, lon1: number,
            lat2: number, lon2: number
        ): number => {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return Math.round(R * c * 10) / 10; // km, rounded to 1 decimal
        };

        test('calculates short distance correctly', () => {
            // Two points about 1km apart in Istanbul
            const distance = calculateDistance(41.0082, 28.9784, 41.0172, 28.9784);
            expect(distance).toBeCloseTo(1, 0);
        });

        test('returns 0 for same location', () => {
            const distance = calculateDistance(41.0082, 28.9784, 41.0082, 28.9784);
            expect(distance).toBe(0);
        });

        test('calculates long distance correctly', () => {
            // Istanbul to Ankara (~350km)
            const distance = calculateDistance(41.0082, 28.9784, 39.9334, 32.8597);
            expect(distance).toBeGreaterThan(300);
            expect(distance).toBeLessThan(400);
        });
    });

    describe('formatDistance', () => {
        const formatDistance = (km: number): string => {
            if (km < 1) {
                return `${Math.round(km * 1000)}m`;
            }
            if (km < 10) {
                return `${km.toFixed(1)}km`;
            }
            return `${Math.round(km)}km`;
        };

        test('formats meters for short distances', () => {
            expect(formatDistance(0.5)).toBe('500m');
        });

        test('formats with decimal for medium distances', () => {
            expect(formatDistance(5.3)).toBe('5.3km');
        });

        test('rounds for long distances', () => {
            expect(formatDistance(42.7)).toBe('43km');
        });
    });

    describe('isWithinRadius', () => {
        const isWithinRadius = (
            userLat: number, userLon: number,
            targetLat: number, targetLon: number,
            radiusKm: number
        ): boolean => {
            const R = 6371;
            const dLat = (targetLat - userLat) * Math.PI / 180;
            const dLon = (targetLon - userLon) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance <= radiusKm;
        };

        test('returns true for point within radius', () => {
            // Two points ~1km apart, 5km radius
            expect(isWithinRadius(41.0082, 28.9784, 41.0172, 28.9784, 5)).toBe(true);
        });

        test('returns false for point outside radius', () => {
            // Istanbul to Ankara (~350km), 100km radius
            expect(isWithinRadius(41.0082, 28.9784, 39.9334, 32.8597, 100)).toBe(false);
        });

        test('returns true for same point', () => {
            expect(isWithinRadius(41.0082, 28.9784, 41.0082, 28.9784, 0)).toBe(true);
        });
    });
});

describe('Coordinate Validation', () => {
    describe('isValidCoordinate', () => {
        const isValidCoordinate = (lat: number, lon: number): boolean => {
            return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
        };

        test('accepts valid coordinates', () => {
            expect(isValidCoordinate(41.0082, 28.9784)).toBe(true);
        });

        test('accepts boundary values', () => {
            expect(isValidCoordinate(90, 180)).toBe(true);
            expect(isValidCoordinate(-90, -180)).toBe(true);
        });

        test('rejects invalid latitude', () => {
            expect(isValidCoordinate(91, 0)).toBe(false);
            expect(isValidCoordinate(-91, 0)).toBe(false);
        });

        test('rejects invalid longitude', () => {
            expect(isValidCoordinate(0, 181)).toBe(false);
            expect(isValidCoordinate(0, -181)).toBe(false);
        });
    });

    describe('formatCoordinates', () => {
        const formatCoordinates = (lat: number, lon: number): string => {
            const latDir = lat >= 0 ? 'N' : 'S';
            const lonDir = lon >= 0 ? 'E' : 'W';
            return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
        };

        test('formats positive coordinates', () => {
            expect(formatCoordinates(41.0082, 28.9784)).toBe('41.0082°N, 28.9784°E');
        });

        test('formats negative coordinates', () => {
            expect(formatCoordinates(-33.8688, -151.2093)).toBe('33.8688°S, 151.2093°W');
        });

        test('formats zero coordinates', () => {
            expect(formatCoordinates(0, 0)).toBe('0.0000°N, 0.0000°E');
        });
    });
});
