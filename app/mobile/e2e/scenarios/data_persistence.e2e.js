describe('Data Persistence', () => {
    beforeAll(async () => {
        jest.setTimeout(300000);
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should persist data after reload and re-login', async () => {
        // 1. Register and Login
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const username = `persist${timestamp}`;
        const email = `persist${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Persist User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('7777777777');
        await element(by.id('signup-email-input')).typeText(email);
        await element(by.id('signup-password-input')).typeText(password);
        await element(by.id('signup-password-input')).tapReturnKey();
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();
        await element(by.text('OK')).tap();

        await element(by.id('signin-email-input')).typeText(email);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();
        await element(by.id('signin-button')).tap();

        // 2. Navigate to Create Request
        // The "Create" tab is the 3rd tab (index 2) or we can find by text "Create"
        await element(by.id('tab-create')).tap();

        // 3. Fill General Info
        await expect(element(by.id('create-request-title-input'))).toBeVisible();
        await element(by.id('create-request-title-input')).typeText(`Volunteer Test Request ${timestamp}`);
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


        // 3. Verify Data Exists
        const requestTitle = `Volunteer Test Request ${timestamp}`;
        await element(by.id('tab-requests')).tap();
        await waitFor(element(by.text(requestTitle)))
            .toBeVisible()
            .whileElement(by.id('requests-list'))
            .scroll(500, 'down');
        await expect(element(by.text(requestTitle))).toBeVisible();

        // 4. Reload App (Simulate restart/reload)
        await device.reloadReactNative();

        // Check if session persists (optional, depends on implementation)
        // If session persists, we should be on Feed. If not, Landing.
        // Let's assume we might need to login again or we are on Landing.
        // But the test says "Data Persistence on Reload AND Re-login".
        // So let's explicitly Logout and Login to be sure we test backend persistence.

        // If we are still logged in, logout.
        try {
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
            // We are logged in.
            await element(by.id('feed-settings-button')).tap();
            await element(by.id('settings-logout-button')).tap();
            await element(by.text('Confirm')).tap(); // Confirm alert
        } catch (e) {
            // We are not logged in (session didn't persist or we are on landing).
            // Check if we are on landing.
            try {
                await expect(element(by.id('landing-login-button'))).toBeVisible();
            } catch (e2) {
                // Unknown state
            }
        }

        // 5. Re-login
        // If we are on landing
        try {
            await element(by.id('landing-login-button')).tap();
        } catch (e) {
            // Maybe we were already on login screen?
        }

        await element(by.id('signin-email-input')).typeText(email);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();
        await element(by.id('signin-button')).tap();

        // 6. Verify Data Persists
        await element(by.id('tab-requests')).tap();
        await waitFor(element(by.text(`Volunteer Test Request ${timestamp}`)))
            .toBeVisible()
            .whileElement(by.id('requests-list'))
            .scroll(500, 'down');
        await expect(element(by.text(`Volunteer Test Request ${timestamp}`))).toBeVisible();
    });
});
