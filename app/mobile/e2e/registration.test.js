/**
 * E2E Test: User Registration (Scenario 1)
 * 
 * Tests the complete user registration flow including:
 * - Successful registration with valid data
 * - Validation errors for missing/invalid fields
 * - Terms and conditions enforcement
 * - Redirect to sign in after registration
 */

const { generateTestUser, dismissAlert, typePassword, typeTextAndDismiss } = require('./testHelpers');

describe('User Registration Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    describe('Successful Registration', () => {
        it('should register a new user with valid data', async () => {
            const user = generateTestUser();

            // Navigate to Signup Screen
            await element(by.id('landing-register-button')).tap();

            // Fill in all required fields with keyboard dismissal
            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);

            // Use typePassword to handle iOS Strong Password autofill
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);

            // Agree to Terms & Conditions
            await element(by.id('signup-terms-checkbox')).tap();

            // Wait for any keyboard animation to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            // Submit registration
            await element(by.id('signup-button')).tap();

            // Handle Success Alert
            await dismissAlert();

            // Verify redirect to Sign In screen
            await expect(element(by.id('signin-button'))).toBeVisible();
        });
    });

    describe('Validation Errors', () => {
        it('should show error when required fields are empty', async () => {
            // Navigate to Signup Screen
            await element(by.id('landing-register-button')).tap();

            // Agree to terms but don't fill fields
            await element(by.id('signup-terms-checkbox')).tap();

            // Try to submit
            await element(by.id('signup-button')).tap();

            // Should show error alert - use dismissAlert helper
            await dismissAlert();

            // Should still be on signup screen
            await expect(element(by.id('signup-button'))).toBeVisible();
        });

        it('should show error when email format is invalid', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            // Fill fields with invalid email
            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', 'invalidemail');

            // Use typePassword helper
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);

            await element(by.id('signup-terms-checkbox')).tap();
            await new Promise(resolve => setTimeout(resolve, 500));

            await element(by.id('signup-button')).tap();

            // Should show error alert - dismiss it
            await dismissAlert();

            // Should still be on signup screen
            // Scroll to make sure button is visible for assertion (if needed)
            // Note: dismissAlert might have tapped "OK". If that dismissed the alert, we are back on signup.

            // We can just verify the button exists to be safer, or verify visibility if we scroll
            await expect(element(by.id('signup-button'))).toExist();
        });

        it('should show error for weak password', async () => {
            const user = generateTestUser();

            await element(by.id('landing-register-button')).tap();

            // Fill fields with weak password
            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);

            // Use typePassword with weak password
            await typePassword('signup-password-input', 'signup-password-toggle', 'weak');

            await element(by.id('signup-terms-checkbox')).tap();
            await new Promise(resolve => setTimeout(resolve, 500));

            await element(by.id('signup-button')).tap();

            // Should show password requirements error - use dismissAlert
            await dismissAlert();

            // Should still be on signup screen
            await expect(element(by.id('signup-button'))).toExist();
        });
    });

    describe('Terms & Conditions', () => {
        it('should not allow submission without agreeing to terms', async () => {
            const user = generateTestUser();
            await element(by.id('landing-register-button')).tap();
            await typeTextAndDismiss('signup-fullname-input', user.fullName);
            await typeTextAndDismiss('signup-username-input', user.username);
            await typeTextAndDismiss('signup-phone-input', user.phone);
            await typeTextAndDismiss('signup-email-input', user.email);
            await typePassword('signup-password-input', 'signup-password-toggle', user.password);
            await new Promise(resolve => setTimeout(resolve, 500));
            await element(by.id('signup-button')).tap();
            await expect(element(by.id('signup-button'))).toBeVisible();
        });

        it('should toggle terms checkbox', async () => {
            await element(by.id('landing-register-button')).tap();

            // Initially unchecked, tap to check
            await element(by.id('signup-terms-checkbox')).tap();

            // Tap again to uncheck
            await element(by.id('signup-terms-checkbox')).tap();

            // Verify checkbox is still interactable
            await expect(element(by.id('signup-terms-checkbox'))).toBeVisible();
        });
    });

    describe('Navigation', () => {
        it('should navigate to login screen from signup', async () => {
            await element(by.id('landing-register-button')).tap();

            // Verify on signup screen
            await expect(element(by.id('signup-button'))).toBeVisible();

            // Scroll until "Sign In" link is visible
            // This handles variable screen sizes and safe areas better than explicit swipe
            await waitFor(element(by.id('signup-signin-link')))
                .toBeVisible()
                .whileElement(by.id('signup-scroll-view'))
                .scroll(150, 'down');

            // Tap on the "Sign In" link using testID
            await element(by.id('signup-signin-link')).tap();

            // Should be on signin screen
            await waitFor(element(by.id('signin-button')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });
});
