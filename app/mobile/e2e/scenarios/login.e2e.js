describe('User Login', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should successfully login with valid credentials', async () => {
        // 1. Navigate to Sign In screen
        await element(by.id('landing-login-button')).tap();
        await expect(element(by.id('signin-email-input'))).toBeVisible();

        // 2. Enter credentials
        // Note: In a real scenario, we should use a user created in the previous test or a seeded user.
        // For now, we'll use the user we (theoretically) created in the registration test,
        // or a hardcoded one if we assume the backend has seed data.
        // Since we can't guarantee the previous test ran or data persistence across launches without configuration,
        // this test might fail if the user doesn't exist.
        // Ideally, we should register a user first within this test or use a mock.
        // For this implementation, I'll assume the user from registration test exists or I'll register one quickly.

        // Let's try to register a fresh user first to ensure independence
        await element(by.text('Back')).tap(); // Go back to landing
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const username = `loginuser${timestamp}`;
        const email = `loginuser${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Login User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('1234567890');
        await element(by.id('signup-email-input')).typeText(email);
        await element(by.id('signup-password-input')).typeText(password);
        await element(by.id('signup-password-input')).tapReturnKey();
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();
        await element(by.text('OK')).tap(); // Dismiss success alert, now at Sign In screen

        // 3. Login with the new user
        await element(by.id('signin-email-input')).typeText(email);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();

        // 4. Submit
        await element(by.id('signin-button')).tap();

        // 5. Verify navigation to Feed
        await expect(element(by.id('feed-search-bar'))).toBeVisible();
        // --- Step 3: Logout ---
        await element(by.id('feed-settings-button')).tap();
        await element(by.id('settings-logout-button')).tap();
        await element(by.text('Confirm')).tap(); // Confirm alert

    });

    it('should show error for invalid credentials', async () => {
        await element(by.id('landing-login-button')).tap();

        await element(by.id('signin-email-input')).typeText('invalid@example.com');
        await element(by.id('signin-password-input')).typeText('wrongpassword');
        await element(by.text('Welcome Back!')).tap();

        await element(by.id('signin-button')).tap();

        // Expect an alert or error message
        // The app uses Alert.alert() for errors
        await expect(element(by.text('Login Failed'))).toBeVisible();
        await element(by.text('OK')).tap();
    });
});
