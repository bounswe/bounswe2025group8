/**
 * Jest Setup File
 * Global mocks and configuration for unit tests
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        canGoBack: jest.fn(() => true),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    useSegments: jest.fn(() => []),
    Link: ({ children }) => children,
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
    useTheme: jest.fn(() => ({
        colors: {
            primary: '#007AFF',
            background: '#FFFFFF',
            card: '#F2F2F7',
            text: '#000000',
            border: '#C6C6C8',
            notification: '#FF3B30',
            onPrimary: '#FFFFFF',
            icon: '#8E8E93',
            textMuted: '#8E8E93',
            overlay: 'rgba(0,0,0,0.5)',
            urgencyHighBackground: '#FFE5E5',
            urgencyHighText: '#D00000',
            urgencyMediumBackground: '#FFF3E0',
            urgencyMediumText: '#FF6D00',
            urgencyLowBackground: '#E8F5E9',
            urgencyLowText: '#2E7D32',
        },
    })),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
        dispatch: jest.fn(),
    })),
    CommonActions: {
        reset: jest.fn(),
    },
}));

// Mock i18n
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: {
            language: 'en',
            changeLanguage: jest.fn(),
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    },
}));

// Mock Auth context
jest.mock('./lib/auth', () => ({
    useAuth: jest.fn(() => ({
        user: null,
        setUser: jest.fn(),
        logout: jest.fn(),
        loading: false,
    })),
    AuthProvider: ({ children }) => children,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            localLanIp: '127.0.0.1',
            apiPort: '8000',
        },
    },
}));

// Mock Alert
jest.spyOn(require('react-native').Alert, 'alert');

// Silence console warnings during tests (optional)
const originalWarn = console.warn;
beforeAll(() => {
    console.warn = (...args) => {
        if (args[0]?.includes?.('Warning:')) return;
        originalWarn(...args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
});
