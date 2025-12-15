/**
 * E2E Test Helper Utilities
 * Shared functions for Detox E2E tests
 */

/**
 * Dismiss the keyboard if it's visible (iOS compatible)
 * Uses multiple fallback methods for reliability
 */
const dismissKeyboard = async () => {
    // Wait a moment for keyboard to fully appear
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        // Method 1: Try to tap on signin scroll view specifically
        await element(by.id('signin-scroll-view')).tap({ x: 10, y: 10 });
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    } catch (e) {
        // Continue to fallback
    }

    try {
        // Method 2: Try generic scroll view
        await element(by.type('RCTScrollView')).atIndex(0).tap({ x: 10, y: 10 });
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    } catch (e) {
        // Continue to fallback
    }

    try {
        // Method 3: Try scrolling slightly to dismiss
        await element(by.type('RCTScrollView')).atIndex(0).scroll(1, 'down');
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    } catch (e) {
        // Continue to fallback
    }

    // Method 4: Just wait and hope keyboard animations complete
    await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Type text and dismiss keyboard
 * @param {string} testID - Element testID
 * @param {string} text - Text to type
 */
const typeTextAndDismiss = async (testID, text) => {
    await element(by.id(testID)).typeText(text);
    await element(by.id(testID)).tapReturnKey();
};

/**
 * Generate unique test data to avoid conflicts
 */
const generateTestUser = () => {
    const timestamp = Date.now();
    return {
        fullName: `Test User ${timestamp}`,
        username: `testuser${timestamp}`,
        email: `testuser${timestamp}@example.com`,
        phone: `555${timestamp.toString().slice(-7)}`,
        password: 'TestPass123!',
    };
};

/**
 * Default test credentials for existing test user
 */
const TEST_CREDENTIALS = {
    email: 'testuser@example.com',
    password: 'password123',
};

/**
 * Login with provided credentials
 * @param {string} email - User email
 * @param {string} password - User password
 */
/**
 * Type password safely (toggles visibility to avoid iOS Strong Password prompt)
 */
const typePassword = async (inputID, toggleID, password) => {
    try {
        // Tap toggle to show password (disables secure entry)
        await element(by.id(toggleID)).tap();
        await new Promise(resolve => setTimeout(resolve, 300));

        // Type password
        await element(by.id(inputID)).typeText(password);

        // Dismiss keyboard
        await element(by.id(inputID)).tapReturnKey();
        await new Promise(resolve => setTimeout(resolve, 300));
    } catch (e) {
        // Fallback if toggle fails (e.g. if testID not found)
        console.warn('Password toggle failed, trying direct input', e);
        await element(by.id(inputID)).typeText(password);
        await element(by.id(inputID)).tapReturnKey();
    }
};

/**
 * Login with provided credentials
 * @param {string} email - User email
 * @param {string} password - User password
 */
const login = async (email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) => {
    await element(by.id('landing-login-button')).tap();
    await element(by.id('signin-email-input')).typeText(email);
    // Use safe password typing with toggle
    await typePassword('signin-password-input', 'signin-password-toggle', password);

    await dismissKeyboard();
    await element(by.id('signin-button')).tap();
    await waitFor(element(by.id('feed-search-bar')))
        .toBeVisible()
        .withTimeout(10000);
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 */
const registerUser = async (userData) => {
    const user = userData || generateTestUser();

    await element(by.id('landing-register-button')).tap();

    await typeTextAndDismiss('signup-fullname-input', user.fullName);
    await typeTextAndDismiss('signup-username-input', user.username);
    await typeTextAndDismiss('signup-phone-input', user.phone);
    await typeTextAndDismiss('signup-email-input', user.email);

    // Use safe password typing with toggle
    await typePassword('signup-password-input', 'signup-password-toggle', user.password);

    await element(by.id('signup-terms-checkbox')).tap();
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation

    await element(by.id('signup-button')).tap();

    // Handle Success Alert and navigation
    await dismissAlert();

    // Should be on Sign In screen now
    await waitFor(element(by.id('signin-button')))
        .toBeVisible()
        .withTimeout(5000);

    return user;
};

/**
 * Wait for an element to be visible with timeout
 * @param {string} testID - Element testID
 * @param {number} timeout - Timeout in ms
 */
const waitForElement = async (testID, timeout = 5000) => {
    await waitFor(element(by.id(testID)))
        .toBeVisible()
        .withTimeout(timeout);
};

/**
 * Wait for an element and tap it
 * @param {string} testID - Element testID
 * @param {number} timeout - Timeout in ms
 */
const waitAndTap = async (testID, timeout = 5000) => {
    await waitFor(element(by.id(testID)))
        .toBeVisible()
        .withTimeout(timeout);
    await element(by.id(testID)).tap();
};

/**
 * Dismiss alert by tapping OK or TAMAM button
 */
const dismissAlert = async () => {
    // Wait for any alert to likely appear first - backend might be slow
    // We try to find the button.
    try {
        // Try English 'OK' first
        // Use atIndex(0) to valid ambiguity if both Title and Button are 'OK'
        await waitFor(element(by.text('OK')).atIndex(0))
            .toBeVisible()
            .withTimeout(5000);

        try {
            await element(by.text('OK')).atIndex(1).tap(); // Try button (index 1 usually)
            return;
        } catch (e) {
            await element(by.text('OK')).atIndex(0).tap(); // Fallback to index 0
            return;
        }
    } catch (e) {
        // Ignore and try Tamam
    }

    try {
        // Try Turkish 'Tamam'
        // Use atIndex(0) to handle multiple 'Tamam' texts (Title + Button)
        await waitFor(element(by.text('Tamam')).atIndex(0))
            .toBeVisible()
            .withTimeout(5000);

        try {
            await element(by.text('Tamam')).atIndex(1).tap(); // Try button (index 1 usually)
            return;
        } catch (e) {
            await element(by.text('Tamam')).atIndex(0).tap(); // Fallback to index 0
            return;
        }
    } catch (e) {
        // Ignore and try last ditch
    }

    // Last ditch: try 'OK' again
    console.warn('Could not find OK or Tamam alert button. Trying one last wait for OK.');
    try {
        await waitFor(element(by.text('OK')).atIndex(0))
            .toBeVisible()
            .withTimeout(5000);
        await element(by.text('OK')).atIndex(0).tap();
    } catch (e) {
        throw new Error('Failed to dismiss alert: OK/Tamam button not found');
    }
};

/**
 * Navigate to Feed screen (assumes logged in)
 */
const navigateToFeed = async () => {
    await waitAndTap('tab-home');
};

/**
 * Navigate to Categories screen
 */
const navigateToCategories = async () => {
    await waitAndTap('tab-categories');
};

/**
 * Navigate to Create Request screen
 */
const navigateToCreateRequest = async () => {
    await waitAndTap('tab-create');
};

/**
 * Navigate to Profile screen
 */
const navigateToProfile = async () => {
    await waitAndTap('tab-profile');
};

/**
 * Navigate to Requests screen
 */
const navigateToRequests = async () => {
    await waitAndTap('tab-requests');
};

/**
 * Logout from the app
 */
const logout = async () => {
    await waitAndTap('feed-settings-button');
    await waitAndTap('settings-logout-button');

    // Handle "Are you sure?" confirmation alert
    // Standardizing on handling "Çıkış Yap" or "Logout" text
    try {
        // Try localized 'Çıkış Yap'
        // There might be multiple matches (Page button, Alert Title, Alert Button)
        // Usually the Alert Button is the last one or has specific traits
        // We try a few indices to be safe, searching for the button

        // Wait for potential alert
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Try to find the button trait 
            await element(by.text('Çıkış Yap').and(by.traits(['button']))).atIndex(0).tap();
        } catch (e) {
            // Fallback to index logic
            try {
                await element(by.text('Çıkış Yap')).atIndex(1).tap();
            } catch (e2) {
                // Ignore
            }
        }

        // Also try English 'Logout' if localization differs
        try {
            await element(by.text('Logout').and(by.traits(['button']))).atIndex(0).tap();
        } catch (e) {
            // Ignore
        }
    } catch (e) {
        console.warn('Logout confirmation handling failed or not needed', e);
    }

    // Verify we are back on landing page
    await waitFor(element(by.id('landing-login-button')))
        .toBeVisible()
        .withTimeout(5000);
};

/**
 * Scroll down on element
 * @param {string} testID - Element testID
 * @param {number} pixels - Pixels to scroll
 */
const scrollDown = async (testID, pixels = 200) => {
    await element(by.id(testID)).scroll(pixels, 'down');
};

/**
 * Check if element exists (without throwing)
 * @param {string} testID - Element testID
 * @returns {Promise<boolean>}
 */
const elementExists = async (testID) => {
    try {
        await expect(element(by.id(testID))).toExist();
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = {
    generateTestUser,
    TEST_CREDENTIALS,
    login,
    registerUser,
    waitForElement,
    waitAndTap,
    dismissAlert,
    dismissKeyboard,
    typeTextAndDismiss,
    typePassword,
    navigateToFeed,
    navigateToCategories,
    navigateToCreateRequest,
    navigateToProfile,
    navigateToRequests,
    logout,
    scrollDown,
    elementExists,
};
