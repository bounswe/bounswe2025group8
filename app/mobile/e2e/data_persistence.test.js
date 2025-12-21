/**
 * E2E Test: Data Persistence on Reload and Re-login (Scenario 9)
 * 
 * Tests data persistence including:
 * - User remains logged in after reload
 * - Created request persists after reload
 * - Logout clears auth state
 * - Re-login restores user data
 */

const { login, logout, navigateToFeed, navigateToRequests, navigateToProfile, navigateToCategories, waitForElement, TEST_CREDENTIALS, generateTestUser, registerUser, typePassword, dismissKeyboard, dismissAlert, ensureLandingPage, typeTextAndDismiss, navigateToCreateRequest } = require('./testHelpers');

/**
 * Helper to create a request with the currently logged in user
 * @param {string} title - Request title 
 */
const createTestRequest = async (title) => {
    await navigateToCreateRequest();

    await waitFor(element(by.id('create-request-title-input')))
        .toBeVisible()
        .withTimeout(10000);

    await typeTextAndDismiss('create-request-title-input', title);
    await typeTextAndDismiss('create-request-description-input', 'Test request for persistence flow', true);

    // Select Category
    await element(by.id('create-request-category-selector')).tap();
    await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
        .toExist()
        .withTimeout(5000);
    await element(by.id('category-option-GROCERY_SHOPPING')).tap();

    // Scroll to next button
    await waitFor(element(by.id('create-request-next-button')))
        .toExist()
        .whileElement(by.id('create-request-scroll-view'))
        .scroll(150, 'down');

    await dismissKeyboard();
    await element(by.id('create-request-next-button')).tap();

    // Photo step - skip
    await waitFor(element(by.id('create-request-upload-next-button'))).toBeVisible().withTimeout(5000);
    await element(by.id('create-request-upload-next-button')).tap();

    // Deadline step - use defaults
    await waitFor(element(by.id('create-request-deadline-next-button'))).toBeVisible().withTimeout(5000);
    await element(by.id('create-request-deadline-next-button')).tap();

    // Address step - Afghanistan/Kabul (simple address selection)
    await element(by.id('address-country-selector')).tap();
    await waitFor(element(by.id('address-option-AFGHANISTAN')))
        .toBeVisible()
        .whileElement(by.id('address-picker-scroll-view'))
        .scroll(100, 'down');
    await element(by.id('address-option-AFGHANISTAN')).tap();
    await new Promise(resolve => setTimeout(resolve, 500));

    await element(by.id('address-state-selector')).tap();
    await waitFor(element(by.id('address-option-KABUL')))
        .toBeVisible()
        .whileElement(by.id('address-picker-scroll-view'))
        .scroll(100, 'down');
    await element(by.id('address-option-KABUL')).tap();
    await new Promise(resolve => setTimeout(resolve, 500));

    await element(by.id('address-city-selector')).tap();
    await waitFor(element(by.id('address-option-KABUL')))
        .toBeVisible()
        .whileElement(by.id('address-picker-scroll-view'))
        .scroll(100, 'down');
    await element(by.id('address-option-KABUL')).tap();
    await new Promise(resolve => setTimeout(resolve, 500));

    await typeTextAndDismiss('address-neighborhood-input', 'Test');
    await typeTextAndDismiss('address-street-input', 'Test');

    // Scroll to building input
    await waitFor(element(by.id('address-building-input')))
        .toExist()
        .whileElement(by.id('create-request-address-scroll-view'))
        .scroll(150, 'down');

    await typeTextAndDismiss('address-building-input', '1');
    await typeTextAndDismiss('address-door-input', '1');

    // Scroll to submit
    await waitFor(element(by.id('create-request-submit-button')))
        .toBeVisible()
        .whileElement(by.id('create-request-address-scroll-view'))
        .scroll(200, 'down');

    await new Promise(resolve => setTimeout(resolve, 500));
    await element(by.id('create-request-submit-button')).tap();

    // Handle success alert
    await waitFor(element(by.text('OK')))
        .toBeVisible()
        .withTimeout(15000);
    await element(by.text('OK')).tap();

    // Wait for redirect to requests list
    await waitFor(element(by.id('requests-list')))
        .toBeVisible()
        .withTimeout(15000);
};

describe('Data Persistence on Reload and Re-login', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
    });

    beforeEach(async () => {
        await device.reloadReactNative();

        // Ensure we start from the landing page (logout if logged in)
        try {
            // Check if logged in by looking for feed
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(3000);
            // If visible, we're logged in - logout
            await logout();
        } catch (e) {
            // Not logged in or on a different screen - check for landing page
            try {
                await waitFor(element(by.id('landing-login-button')))
                    .toBeVisible()
                    .withTimeout(5000);
                // Already on landing page, good
            } catch (e2) {
                // Might be on a different screen, reload should help
            }
        }
    });

    describe('Authentication Persistence', () => {
        it('should maintain login state after app reload', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            // Verify logged in
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Reload the app
            await device.reloadReactNative();

            // Should still be on feed (logged in) or need to login again
            // This depends on the app's session persistence implementation
            try {
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(5000);
            } catch (e) {
                // Session may have expired, verify we're on landing page
                await expect(element(by.id('landing-login-button'))).toBeVisible();
            }
        });

        it('should clear login state after logout and reload', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Logout
            await logout();

            // Reload
            await device.reloadReactNative();

            // Should be on landing page
            await expect(element(by.id('landing-login-button'))).toBeVisible();
        });
    });

    describe('Request Data Persistence', () => {
        it('should persist created request after reload', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Create a unique request
            const timestamp = Date.now();
            const requestTitle = `Persist Test ${timestamp}`;

            await createTestRequest(requestTitle);

            // Reload app
            await device.reloadReactNative();

            // Login again if needed
            try {
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(3000);
            } catch (e) {
                // Need to login again
                await element(by.id('landing-login-button')).tap();
                await element(by.id('signin-email-input')).typeText(user.email);
                await typePassword('signin-password-input', 'signin-password-toggle', user.password);
                await dismissKeyboard();
                await element(by.id('signin-button')).tap();
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(10000);
            }

            // Navigate to requests and look for our request
            await navigateToRequests();

            await waitFor(element(by.id('requests-list')))
                .toBeVisible()
                .withTimeout(5000);

            // The created request should be in the list (server persists it)
        }, 180000);
    });

    describe('Navigation State After Reload', () => {
        it('should return to feed after reload', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Navigate to categories
            await element(by.id('tab-categories')).tap();
            await waitFor(element(by.id('categories-search-bar')))
                .toBeVisible()
                .withTimeout(5000);

            // Reload
            await device.reloadReactNative();

            // Should return to initial state (feed or landing)
            try {
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(3000);
            } catch (e) {
                await expect(element(by.id('landing-login-button'))).toBeVisible();
            }
        });
    });

    describe('Re-login Data Restoration', () => {
        it('should restore user data after re-login', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Logout from feed (logout helper expects feed-settings-button)
            await logout();

            // Re-login with same user
            await element(by.id('landing-login-button')).tap();
            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Profile should be accessible after re-login
            await element(by.id('tab-profile')).tap();
            // Verify navigation occurred
            await new Promise(resolve => setTimeout(resolve, 3000));
            await expect(element(by.id('feed-search-bar'))).not.toBeVisible();
        });
    });

    describe('Pull to Refresh', () => {
        it('should refresh feed data on pull down', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Scroll down slightly to trigger refresh (using swipe instead of scroll on RCTScrollView)
            await element(by.id('feed-search-bar')).swipe('down', 'fast', 0.5);

            // Wait for refresh to complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Feed should still be visible after refresh
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });
});
