describe('Error Handling and Validation', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should show validation errors for registration', async () => {
        await element(by.id('landing-register-button')).tap();

        // Try to submit empty form
        await element(by.id('signup-button')).tap();

        // Verify Alert "Validation Error" or similar
        // Detox handles alerts by matching text.
        // In signup.tsx: Alert.alert('Validation Error', 'Please fill in all fields.');
        await expect(element(by.text('Validation Error'))).toBeVisible();
        await element(by.text('OK')).tap();

        // Fill some fields but miss one (e.g. password)
        await element(by.id('signup-fullname-input')).typeText('Error User');
        await element(by.id('signup-username-input')).typeText('erroruser');
        await element(by.id('signup-phone-input')).typeText('1234567890');
        await element(by.id('signup-email-input')).typeText('error@example.com');
        // Skip password
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();

        await expect(element(by.text('Validation Error'))).toBeVisible();
        await element(by.text('OK')).tap();
    });

    it('should show validation errors for create request', async () => {
        // Login first
        await element(by.id('landing-login-button')).tap();

        // Register a user to ensure we can login
        await element(by.text('Back')).tap();
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const email = `erruser${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Err User');
        await element(by.id('signup-username-input')).typeText(`erruser${timestamp}`);
        await element(by.id('signup-phone-input')).typeText('1231231234');
        await element(by.id('signup-email-input')).typeText(email);
        await element(by.id('signup-password-input')).typeText(password);
        await element(by.id('signup-password-input')).tapReturnKey();
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();
        await element(by.text('OK')).tap();

        // Login
        await element(by.id('signin-email-input')).typeText(email);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();
        await element(by.id('signin-button')).tap();

        // Go to Create Request
        await element(by.text('Create')).tap();

        // Try to proceed without title
        await element(by.id('create-request-next-button')).tap();

        // Verify Alert "Validation Error"
        // In create_request.tsx: Alert.alert('Validation Error', 'Title is required.');
        await expect(element(by.text('Validation Error'))).toBeVisible();
        await element(by.text('OK')).tap();

        // Fill title but miss description
        await element(by.id('create-request-title-input')).typeText('Test Title');
        await element(by.id('create-request-next-button')).tap();

        // In create_request.tsx: Alert.alert('Validation Error', 'Description is required.');
        await expect(element(by.text('Validation Error'))).toBeVisible();
        await element(by.text('OK')).tap();
    });
});
