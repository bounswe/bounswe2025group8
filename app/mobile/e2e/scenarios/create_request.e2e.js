describe('Create Request', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should successfully create a new request', async () => {
        // 1. Login first
        await element(by.id('landing-login-button')).tap();

        // Use the user created in previous tests or a standard test user
        // For stability, let's register a new one for this test
        await element(by.text('Back')).tap();
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const username = `requester${timestamp}`;
        const email = `requester${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Requester User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('1234567890');
        await element(by.id('signup-email-input')).typeText(email);
        await element(by.id('signup-password-input')).typeText(password);
        await element(by.id('signup-password-input')).tapReturnKey();
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();
        await element(by.text('OK')).tap(); // Dismiss success alert

        // Login
        await element(by.id('signin-email-input')).typeText(email);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();
        await element(by.id('signin-button')).tap();

        // Verify we are on Feed
        await expect(element(by.id('feed-search-bar'))).toBeVisible();

        // 2. Navigate to Create Request
        // The "Create" tab is the 3rd tab (index 2) or we can find by text "Create"
        await element(by.id('tab-create')).tap();

        // 3. Fill General Info
        await expect(element(by.id('create-request-title-input'))).toBeVisible();
        await element(by.id('create-request-title-input')).typeText('Test Request Title');
        await element(by.id('create-request-description-input')).typeText('This is a test request description.');

        // Select Category (optional, let's keep default)
        // Select Urgency (optional, let's keep default)

        await element(by.text('General Information')).tap();
        await element(by.id('create-request-next-button')).tap();

        // 4. Upload Photo Screen
        await expect(element(by.id('upload-photo-next-button'))).toBeVisible();
        await element(by.id('upload-photo-next-button')).tap();

        // 5. Deadline Screen
        await expect(element(by.text('Determine Deadline'))).toBeVisible();

        // Select Date/Time: Next Day (Test Helper)
        await element(by.id('set-next-day-button')).tap();

        await element(by.id('deadline-next-button')).tap();

        // 6. Address Screen
        await expect(element(by.id('address-city-selector'))).toBeVisible();

        // Select City
        // Select City
        await element(by.id('address-city-selector')).tap();
        await waitFor(element(by.text('Adana')))
            .toBeVisible()
            .whileElement(by.id('address-picker-scrollview'))
            .scroll(500, 'down');
        await element(by.text('Adana')).tap();

        // Select District
        await element(by.id('address-district-selector')).tap();
        await waitFor(element(by.text('Kozan')))
            .toBeVisible()
            .whileElement(by.id('address-picker-scrollview'))
            .scroll(500, 'down');
        await element(by.text('Kozan')).tap();

        // Select Neighborhood
        await element(by.id('address-neighborhood-selector')).tap();
        await waitFor(element(by.text('Gazi Mah')))
            .toBeVisible()
            .whileElement(by.id('address-picker-scrollview'))
            .scroll(500, 'down');
        await element(by.text('Gazi Mah')).tap();

        // Fill details
        await element(by.id('address-street-input')).typeText('Moda Cd.');
        await element(by.text('Setup Address')).tap();
        await element(by.id('address-building-input')).typeText('10');
        await element(by.text('Setup Address')).tap();
        await element(by.id('address-door-input')).typeText('5');
        await element(by.text('Setup Address')).tap();
        await element(by.id('address-description-input')).typeText('Near the park');

        // 7. Submit
        await element(by.text('Setup Address')).tap();
        await element(by.id('create-request-submit-button')).tap();

        // 8. Verify Success
        await expect(element(by.text('Success'))).toBeVisible();
        await element(by.text('OK')).tap();

        // Logout to clean up
        await element(by.id('feed-settings-button')).tap();
        await element(by.id('settings-logout-button')).tap();
        await element(by.text('Confirm')).tap();
    });
});
