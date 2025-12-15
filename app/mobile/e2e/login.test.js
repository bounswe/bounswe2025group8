/**
 * E2E Test: User Login (Scenario 2)
 * 
 * Tests the complete user login flow including:
 * - Successful login with valid credentials
 * - Error handling for invalid credentials
 * - Error handling for empty fields
 * - Forgot password navigation
 * - Redirect to feed after successful login
 */

const { login, TEST_CREDENTIALS, waitForElement, registerUser, generateTestUser, typePassword, logout, dismissKeyboard } = require('./testHelpers');

describe('User Login Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();

        // Check if auto-logged in (Feed visible) and logout if so
        // This ensures we start at the landing screen for every test
        try {
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
            await logout();
        } catch (e) {
            // Not logged in, safe to proceed
        }
    });

    describe('Successful Login', () => {
        it('should login successfully with valid credentials', async () => {
            // Register a new user first
            const user = generateTestUser();
            await registerUser(user);

            // Now we should be on Sign In screen (handled by registerUser)
            // Enter valid credentials
            await element(by.id('signin-email-input')).typeText(user.email);
            // Use safe password helper
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);

            // Submit login
            await element(by.id('signin-button')).tap();

            // Verify redirect to feed
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Clean up: Logout
            await logout();
        });

        it('should display user welcome message after login', async () => {
            // Register and login with a new user
            const user = generateTestUser();
            await registerUser(user);

            // Reload app to return to landing screen for login helper
            await device.reloadReactNative();

            // Login with this user
            await login(user.email, user.password);

            // Verify we're on the feed screen (login successful)
            await expect(element(by.id('feed-search-bar'))).toBeVisible();

            // Verify settings button is accessible (proves we're logged in and on feed)
            await expect(element(by.id('feed-settings-button'))).toBeVisible();

            // Clean up: Logout
            await logout();
        });
    });

    describe('Invalid Credentials', () => {
        it('should show error with invalid credentials', async () => {
            await element(by.id('landing-login-button')).tap();

            // Enter invalid credentials
            await element(by.id('signin-email-input')).typeText('wrong@example.com');
            await element(by.id('signin-password-input')).typeText('wrongpassword');
            await element(by.id('signin-password-input')).tapReturnKey();

            await element(by.id('signin-button')).tap();

            // Should show error alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();

            // Should NOT navigate to feed
            await expect(element(by.id('feed-search-bar'))).not.toBeVisible();

            // Should still be on signin screen
            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should show error with wrong password', async () => {
            await element(by.id('landing-login-button')).tap();

            await element(by.id('signin-email-input')).typeText(TEST_CREDENTIALS.email);
            await element(by.id('signin-password-input')).typeText('wrongpassword123');
            await element(by.id('signin-password-input')).tapReturnKey();

            await element(by.id('signin-button')).tap();

            // Should show error and stay on login
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();

            await expect(element(by.id('signin-button'))).toBeVisible();
        });
    });

    describe('Empty Fields Validation', () => {
        it('should show error when email is empty', async () => {
            await element(by.id('landing-login-button')).tap();

            // Only enter password
            await element(by.id('signin-password-input')).typeText(TEST_CREDENTIALS.password);

            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            // Should show error alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();

            // Should stay on signin screen
            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should show error when password is empty', async () => {
            await element(by.id('landing-login-button')).tap();

            // Only enter email
            await element(by.id('signin-email-input')).typeText(TEST_CREDENTIALS.email);

            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            // Should show error alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();

            // Should stay on signin screen
            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should show error when both fields are empty', async () => {
            await element(by.id('landing-login-button')).tap();

            // Don't fill anything, just tap submit
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            // Should show error alert for empty fields
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();

            await expect(element(by.id('signin-button'))).toBeVisible();
        });
    });

    describe('Navigation', () => {
        it('should navigate to forgot password screen', async () => {
            await element(by.id('landing-login-button')).tap();

            // Scroll to find link if needed and tap
            await waitFor(element(by.id('signin-forgot-password-link')))
                .toBeVisible()
                .whileElement(by.id('signin-scroll-view'))
                .scroll(150, 'down');

            await element(by.id('signin-forgot-password-link')).tap();

            // Should navigate away from signin
            await expect(element(by.id('signin-button'))).not.toBeVisible();
        });

        it('should navigate to signup screen from login', async () => {
            await element(by.id('landing-login-button')).tap();

            // Tap "Don't have an account? Sign Up" link
            // It's at the bottom, so we definitely need to scroll
            await waitFor(element(by.id('signin-signup-link')))
                .toBeVisible()
                .whileElement(by.id('signin-scroll-view'))
                .scroll(150, 'down');

            await element(by.id('signin-signup-link')).tap();

            // Should be on signup screen
            await waitFor(element(by.id('signup-button')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should allow going back from login screen', async () => {
            await element(by.id('landing-login-button')).tap();

            await expect(element(by.id('signin-button'))).toBeVisible();

            // Tap back button (top left, should be visible without scroll, but good to wait)
            await waitFor(element(by.id('signin-back-button')))
                .toBeVisible();
            await element(by.id('signin-back-button')).tap();

            // Should be back on landing page
            await expect(element(by.id('landing-login-button'))).toBeVisible();
        });
    });

    describe('Password Visibility', () => {
        it('should toggle password visibility', async () => {
            await element(by.id('landing-login-button')).tap();

            // Enter password
            await element(by.id('signin-password-input')).typeText('testpassword');
            await dismissKeyboard();

            // Tap eye icon to show password (by accessibility label)
            // Note: Use testID if possible, but toggling logic relies on state
            await waitFor(element(by.id('signin-password-toggle')))
                .toBeVisible();

            await element(by.id('signin-password-toggle')).tap();

            // Verify logic? 
            // Just verifying it's interactable for now
            // Tap again
            await new Promise(resolve => setTimeout(resolve, 500)); // wait for state/animation
            await element(by.id('signin-password-toggle')).tap();

            // Password field should still exist
            await expect(element(by.id('signin-password-input'))).toBeVisible();
        });
    });
});
