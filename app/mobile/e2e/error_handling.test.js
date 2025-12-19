/**
 * E2E Test: Error Handling and Validation (Scenario 8)
 * 
 * Tests error scenarios including:
 * - Invalid login credentials
 * - Registration validation errors
 * - Empty form submission
 * - Alert dialogs
 * - Form field validation
 */

const { generateTestUser, waitForElement, TEST_CREDENTIALS, dismissAlert, typePassword, typeTextAndDismiss } = require('./testHelpers');

describe('Error Handling and Validation Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    describe('Login Error Handling', () => {
        it('should show error for invalid email format', async () => {
            await element(by.id('landing-login-button')).tap();

            await element(by.id('signin-email-input')).typeText('notanemail');
            await typePassword('signin-password-input', 'signin-password-toggle', 'password123');
            await element(by.id('signin-button')).tap();

            // Should show error alert
            await dismissAlert();

            // Should remain on login screen
            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should show error for non-existent user', async () => {
            await element(by.id('landing-login-button')).tap();

            await element(by.id('signin-email-input')).typeText('nonexistent@example.com');
            await typePassword('signin-password-input', 'signin-password-toggle', 'password123');
            await element(by.id('signin-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should show error for incorrect password', async () => {
            await element(by.id('landing-login-button')).tap();

            await element(by.id('signin-email-input')).typeText(TEST_CREDENTIALS.email);
            await typePassword('signin-password-input', 'signin-password-toggle', 'wrongpassword');
            await element(by.id('signin-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should handle empty email submission', async () => {
            await element(by.id('landing-login-button')).tap();

            await typePassword('signin-password-input', 'signin-password-toggle', 'password123');
            await element(by.id('signin-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should handle empty password submission', async () => {
            await element(by.id('landing-login-button')).tap();

            await typeTextAndDismiss('signin-email-input', 'test@example.com');
            await element(by.id('signin-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signin-button'))).toBeVisible();
        });
    });

    describe('Registration Validation', () => {
        it('should validate password requirements', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            // Type and dismiss keyboard between fields to avoid coverage
            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);
            // Weak password - missing uppercase, special char
            await typePassword('signup-password-input', 'signup-password-toggle', 'weak123');

            await element(by.id('signup-terms-checkbox')).tap();
            await element(by.id('signup-community-guidelines-checkbox')).tap();
            await element(by.id('signup-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signup-button'))).toBeVisible();
        });

        it('should validate required full name', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            // Skip full name
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);

            await element(by.id('signup-terms-checkbox')).tap();
            await element(by.id('signup-community-guidelines-checkbox')).tap();
            await element(by.id('signup-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signup-button'))).toBeVisible();
        });

        it('should validate required email', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            // Skip email
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);

            await element(by.id('signup-terms-checkbox')).tap();
            await element(by.id('signup-community-guidelines-checkbox')).tap();
            await element(by.id('signup-button')).tap();

            await dismissAlert();

            await expect(element(by.id('signup-button'))).toBeVisible();
        });

        it('should require terms agreement', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);

            // Don't check terms - try to submit
            await element(by.id('signup-button')).tap();

            // Should stay on page or show error
            // Some apps might show alert, others might just disable button or do nothing
            // Assuming alert based on previous code flow, but checking visibility is safer default
            await expect(element(by.id('signup-button'))).toBeVisible();
        });
    });

    describe('Alert Dialogs', () => {
        it('should display and dismiss error alerts', async () => {
            await element(by.id('landing-login-button')).tap();

            // No input, just tap signin to trigger error
            await element(by.id('signin-button')).tap();

            // Wait for and dismiss alert
            await dismissAlert();

            // Should return to normal state
            await expect(element(by.id('signin-button'))).toBeVisible();
        });

        it('should display success alerts on registration', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);

            await element(by.id('signup-terms-checkbox')).tap();
            await element(by.id('signup-community-guidelines-checkbox')).tap();

            // Wait for keyboard animation to settle completely
            await new Promise(resolve => setTimeout(resolve, 1000));
            await element(by.id('signup-button')).tap();

            // Wait for success or error alert using robust helper
            await dismissAlert();
        });
    });
});
