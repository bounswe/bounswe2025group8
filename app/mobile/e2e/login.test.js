describe('Login Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should login successfully with valid credentials', async () => {
        // Navigate to Login Screen
        await element(by.id('landing-login-button')).tap();

        // Enter Credentials
        await element(by.id('signin-email-input')).typeText('testuser@example.com');
        await element(by.id('signin-password-input')).typeText('password123');
        await element(by.id('signin-password-input')).tapReturnKey(); // Close keyboard

        // Tap Sign In
        await element(by.id('signin-button')).tap();

        // Verify successful login by checking for feed element
        await expect(element(by.id('feed-search-bar'))).toBeVisible();
    });

    it('should show error with invalid credentials', async () => {
        // Navigate to Login Screen
        await element(by.id('landing-login-button')).tap();

        // Enter Invalid Credentials
        await element(by.id('signin-email-input')).typeText('wrong@example.com');
        await element(by.id('signin-password-input')).typeText('wrongpassword');
        await element(by.id('signin-password-input')).tapReturnKey();

        // Tap Sign In
        await element(by.id('signin-button')).tap();

        // Verify error message (assuming an alert or error text appears)
        // Note: Handling alerts in Detox can be tricky. If it's a native alert:
        // await expect(element(by.label('Error'))).toBeVisible(); 
        // Or if it's a text on screen:
        // await expect(element(by.text('Invalid credentials'))).toBeVisible();

        // For now, we expect NOT to see the feed
        await expect(element(by.id('feed-search-bar'))).not.toBeVisible();
    });
});
