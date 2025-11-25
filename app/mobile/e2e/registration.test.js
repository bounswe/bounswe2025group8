describe('Registration Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should register a new user successfully', async () => {
        // Navigate to Signup Screen
        await element(by.id('landing-register-button')).tap();

        // Generate random user details to avoid conflicts
        const timestamp = new Date().getTime();
        const username = `user${timestamp}`;
        const email = `user${timestamp}@example.com`;

        // Fill Form
        await element(by.id('signup-fullname-input')).typeText('Test User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('1234567890');
        await element(by.id('signup-email-input')).typeText(email);
        await element(by.id('signup-password-input')).typeText('password123');
        await element(by.id('signup-password-input')).tapReturnKey();

        // Agree to Terms
        await element(by.id('signup-terms-checkbox')).tap();

        // Tap Sign Up
        await element(by.id('signup-button')).tap();

        // Handle Success Alert
        // Note: Adjust text if the alert title/button is different
        await waitFor(element(by.text('OK'))).toBeVisible().withTimeout(5000);
        await element(by.text('OK')).tap();

        // Verify redirect to Sign In screen
        await expect(element(by.id('signin-button'))).toBeVisible();
    });
});
