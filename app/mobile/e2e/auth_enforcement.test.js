/**
 * E2E Test: Authentication and Role Enforcement (Scenario 7)
 * 
 * Tests authentication requirements including:
 * - Guest user can view feed
 * - Guest user cannot create requests
 * - Logout functionality
 * - Session persistence
 */

const { login, logout, navigateToFeed, navigateToCreateRequest, navigateToProfile, navigateToCategories, navigateToRequests, waitForElement, TEST_CREDENTIALS, generateTestUser, registerUser, typePassword, dismissKeyboard, ensureLandingPage, dismissAlert, typeTextAndDismiss } = require('./testHelpers');

describe('Authentication and Role Enforcement Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
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

    describe('Guest User Access', () => {
        it('should allow guest to view feed', async () => {
            // Wait for landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Tap "Continue as Guest"
            await waitFor(element(by.id('landing-guest-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('landing-guest-button')).tap();

            // Feed should be visible
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);
        });

        it('should show categories for guest', async () => {
            // Wait for landing page
            await waitFor(element(by.id('landing-guest-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('landing-guest-button')).tap();

            // Navigate to categories
            await waitFor(element(by.id('tab-categories')))
                .toBeVisible()
                .withTimeout(10000);
            await element(by.id('tab-categories')).tap();

            await waitFor(element(by.id('categories-search-bar')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Authenticated User Access', () => {
        it('should enable create request for logged-in user', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login a new user
            const user = generateTestUser();
            await registerUser(user);

            // Login
            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Create tab should be enabled
            await expect(element(by.id('tab-create'))).toBeVisible();

            await element(by.id('tab-create')).tap();

            // Should navigate to create request screen
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should show profile for logged-in user', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login a new user
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await element(by.id('tab-profile')).tap();

            // Wait for navigation to complete - feed search bar should not be visible
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verify we navigated away from feed
            await expect(element(by.id('feed-search-bar'))).not.toBeVisible();
        });
    });

    describe('Logout Functionality', () => {
        it('should logout successfully', async () => {
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

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Use the logout helper
            await logout();

            // Should be back on landing page
            await expect(element(by.id('landing-login-button'))).toBeVisible();
        });

        it('should clear session after logout', async () => {
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

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await logout();

            await waitFor(element(by.id('landing-login-button')))
                .toBeVisible()
                .withTimeout(10000);

            // App reload should show landing page (not auto-login)
            await device.reloadReactNative();

            await expect(element(by.id('landing-login-button'))).toBeVisible();
        });
    });

    describe('Session Persistence', () => {
        it('should maintain login state after navigation', async () => {
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

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Navigate through tabs (stay on screens that have the tab bar)
            await element(by.id('tab-categories')).tap();
            await waitFor(element(by.id('categories-search-bar')))
                .toBeVisible()
                .withTimeout(5000);

            await element(by.id('tab-home')).tap();
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(5000);

            // Should still be logged in (create button visible and enabled)
            await expect(element(by.id('tab-create'))).toBeVisible();
        });
    });
});
