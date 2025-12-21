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
    await new Promise(resolve => setTimeout(resolve, 300));

    // Method 0: Try to tap on the screen title if it exists
    try {
        await waitFor(element(by.id('screen-title'))).toBeVisible().withTimeout(500);
        await element(by.id('screen-title')).tap();
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    } catch (e) { }

    // Method 1: Try specific scroll views but tap safe area
    const scrollViews = [
        'signup-scroll-view',
        'signin-scroll-view',
        'create-request-scroll-view',
        'create-request-address-scroll-view',
        'create-request-upload-scroll-view',
        'create-request-deadline-scroll-view'
    ];

    for (const id of scrollViews) {
        try {
            await waitFor(element(by.id(id))).toBeVisible().withTimeout(300);
            await element(by.id(id)).tap({ x: 150, y: 30 }); // Tap near top but center
            await new Promise(resolve => setTimeout(resolve, 300));
            return;
        } catch (e) { }
    }

    // Method 2: Generic RCTScrollView fallback
    try {
        await element(by.type('RCTScrollView')).atIndex(0).tap({ x: 150, y: 30 });
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
    } catch (e) { }

    // Final fallback: just wait
    await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Type text and dismiss keyboard
 * @param {string} testID - Element testID
 * @param {string} text - Text to type
 * @param {boolean} multiline - Whether the input is multiline (skips Return Key)
 */
const typeTextAndDismiss = async (testID, text, multiline = false) => {
    await element(by.id(testID)).typeText(text);
    // tapReturnKey is often enough for single-line inputs, but adds a newline for multiline
    if (!multiline) {
        try {
            await element(by.id(testID)).tapReturnKey();
        } catch (e) { }
    }
    await dismissKeyboard();
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
        await dismissKeyboard();
        await new Promise(resolve => setTimeout(resolve, 300));
    } catch (e) {
        // Fallback if toggle fails (e.g. if testID not found)
        console.warn('Password toggle failed, trying direct input', e);
        await element(by.id(inputID)).typeText(password);
        await dismissKeyboard();
    }
};

/**
 * Login with provided credentials
 * @param {string} email - User email
 * @param {string} password - User password
 */
const login = async (email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) => {
    await element(by.id('landing-login-button')).tap();
    await typeTextAndDismiss('signin-email-input', email);
    // Use safe password typing with toggle
    await typePassword('signin-password-input', 'signin-password-toggle', password);

    // typePassword now handles keyboard dismissal at the end
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
    await element(by.id('signup-community-guidelines-checkbox')).tap();
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
 * Uses atIndex(0) to handle potential duplicates during transitions
 * @param {string} testID - Element testID
 * @param {number} timeout - Timeout in ms
 */
const waitAndTap = async (testID, timeout = 5000) => {
    await waitFor(element(by.id(testID)).atIndex(0))
        .toBeVisible()
        .withTimeout(timeout);
    await element(by.id(testID)).atIndex(0).tap();
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
    await dismissKeyboard();
    await waitAndTap('tab-home');
};

/**
 * Navigate to Categories screen
 */
const navigateToCategories = async () => {
    await dismissKeyboard();
    await waitAndTap('tab-categories');
};

/**
 * Navigate to Create Request screen
 */
const navigateToCreateRequest = async () => {
    await dismissKeyboard();
    await waitAndTap('tab-create');
};

/**
 * Navigate to Profile screen
 */
const navigateToProfile = async () => {
    await dismissKeyboard();
    await waitAndTap('tab-profile');
};

/**
 * Navigate to Requests screen
 */
const navigateToRequests = async () => {
    await dismissKeyboard();
    try {
        await waitAndTap('tab-requests', 5000);
    } catch (e) {
        console.warn('Tap by ID failed, trying by text "Requests" / "İstekler"');
        try {
            // Try English
            await element(by.text('Requests')).atIndex(0).tap();
        } catch (e2) {
            // Try Turkish
            await element(by.text('İstekler')).atIndex(0).tap();
        }
    }

    // Wait for the requests list to appear, confirming navigation succeeded
    await waitFor(element(by.id('requests-list')))
        .toBeVisible()
        .withTimeout(10000);
};

/**
 * Logout from the app
 */
const logout = async () => {
    // fast check if we are already on landing page
    try {
        await expect(element(by.id('landing-login-button'))).toBeVisible();
        return; // Already logged out
    } catch (e) {
        // Continue to logout
    }

    try {
        // Try to find settings button - could be on Feed or Requests (both have feed-settings-button now)
        await waitFor(element(by.id('feed-settings-button')))
            .toBeVisible()
            .withTimeout(5000);
        await element(by.id('feed-settings-button')).tap();
    } catch (e) {
        // failing to find settings button usually means we are in a weird state.
        // Try simple back navigation loop or just fail?
        // Let's assume we might be in a submenu.
        console.warn('Settings button not found, attempting to continue logout flow anyway or failing', e);
    }

    try {
        await waitFor(element(by.id('settings-logout-button')))
            .toBeVisible()
            .withTimeout(5000);
        await element(by.id('settings-logout-button')).tap();
    } catch (e) {
        console.warn('Logout button not found');
    }

    // Handle "Are you sure?" confirmation alert
    // The alert has a specific "Çıkış Yap" button (Red), not just "OK"
    try {
        // Wait for alert to appear
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try finding the specific confirmation button
        // Based on user screenshot: Text is "Çıkış Yap"
        // We try looking for the button with that text.
        // atIndex(0) or (1) might be needed if title is also same text

        // Try localized 'Çıkış Yap' button (usually index 1 if title captures index 0)
        try {
            await element(by.text('Çıkış Yap')).atIndex(1).tap();
        } catch (e) {
            // Fallback to index 0 (if valid)
            await element(by.text('Çıkış Yap')).atIndex(0).tap();
        }
    } catch (e) {
        console.warn('Logout confirmation specific button failed, trying generic dismiss');
        await dismissAlert();
    }

    // Verify we are back on landing page
    await waitFor(element(by.id('landing-login-button')))
        .toBeVisible()
        .withTimeout(10000);
};

/**
 * Ensures the app is on the landing page (logged out state)
 * Reloads RN, checks if logged in, and logs out if necessary.
 */
const ensureLandingPage = async () => {
    await device.reloadReactNative();

    // Wait for either landing screen OR feed screen
    // Increased timeout to 15s to account for Splash Screen / Loading
    try {
        await waitFor(element(by.id('feed-search-bar')))
            .toBeVisible()
            .withTimeout(15000);

        // If visible, we are logged in
        await logout();
    } catch (e) {
        // If feed search bar is not visible, check if we are on landing page
        try {
            await waitFor(element(by.id('landing-login-button')))
                .toBeVisible()
                .withTimeout(15000);
        } catch (e2) {
            console.error('Neither feed nor landing page visible after reload. App might be in undefined state.');
            throw new Error('ensureLandingPage failed: Could not determine app state (neither Feed nor Landing visible)');
        }
    }
};

/**
 * Scroll down on a scroll view ID
 */
const scrollDown = async (testID, amount = 100) => {
    await element(by.id(testID)).scroll(amount, 'down');
};

/**
 * Check if element exists
 */
const elementExists = async (matcher) => {
    try {
        await expect(matcher).toExist();
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = {
    waitAndTap,
    login,
    generateTestUser,
    registerUser,
    TEST_CREDENTIALS,
    waitForElement,
    dismissAlert,
    typeTextAndDismiss,
    typePassword,
    dismissKeyboard,
    navigateToFeed,
    navigateToCategories,
    navigateToCreateRequest,
    navigateToProfile,
    navigateToRequests,
    logout,
    ensureLandingPage,
    scrollDown,
    elementExists,
};
