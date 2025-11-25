describe('Create Request Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        await login();
    });

    const login = async () => {
        await element(by.id('landing-login-button')).tap();
        await element(by.id('signin-email-input')).typeText('testuser@example.com');
        await element(by.id('signin-password-input')).typeText('password123');
        await element(by.id('signin-password-input')).tapReturnKey();
        await element(by.id('signin-button')).tap();
        await expect(element(by.id('feed-search-bar'))).toBeVisible();
    };

    it('should create a new request successfully', async () => {
        // Navigate to Create Request Tab
        await element(by.id('tab-create')).tap();

        // 1. General Info
        await element(by.id('create-request-title-input')).typeText('E2E Test Request');
        await element(by.id('create-request-description-input')).typeText('This is a test request created by Detox.');
        await element(by.id('create-request-description-input')).tapReturnKey(); // Close keyboard if needed

        // Increase people count
        await element(by.id('create-request-people-increase')).tap();

        await element(by.id('create-request-next-button')).tap();

        // 2. Upload Photo (Skip for now)
        await element(by.id('create-request-upload-next-button')).tap();

        // 3. Deadline (Use defaults)
        await element(by.id('create-request-deadline-next-button')).tap();

        // 4. Address
        // Select Country
        await element(by.id('address-country-selector')).tap();
        await element(by.text('Turkey')).tap(); // Assuming Turkey is in the list

        // Select State
        await element(by.id('address-state-selector')).tap();
        await element(by.text('Istanbul')).tap(); // Assuming Istanbul is in the list

        // Select City
        await element(by.id('address-city-selector')).tap();
        await element(by.text('Besiktas')).tap(); // Assuming Besiktas is in the list

        // Fill details
        await element(by.id('address-neighborhood-input')).typeText('Test Neighborhood');
        await element(by.id('address-street-input')).typeText('Test Street');
        await element(by.id('address-building-input')).typeText('1');
        await element(by.id('address-door-input')).typeText('1');
        await element(by.id('address-door-input')).tapReturnKey();

        await element(by.id('create-request-address-description')).typeText('Near the test landmark');
        await element(by.id('create-request-address-description')).tapReturnKey();

        // Submit
        await element(by.id('create-request-submit-button')).tap();

        // Handle Success Alert
        await waitFor(element(by.text('OK'))).toBeVisible().withTimeout(10000); // Wait for upload/creation
        await element(by.text('OK')).tap();

        // Verify redirect to Requests feed (or wherever it goes)
        // Assuming it goes to 'requests' tab or feed
        await expect(element(by.id('feed-search-bar'))).toBeVisible();
    });
});
