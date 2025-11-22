describe('Data Persistence', () => {
    beforeAll(async () => {
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

        // 2. Create Data (Request)
        await element(by.text('Create')).tap();
        const requestTitle = `Persistence Test ${timestamp}`;
        await element(by.id('create-request-title-input')).typeText(requestTitle);
        await element(by.id('create-request-description-input')).typeText('Testing persistence.');
        await element(by.id('create-request-next-button')).tap();
        await element(by.id('upload-photo-next-button')).tap();
        await element(by.id('deadline-next-button')).tap();

        // Address
        await element(by.id('address-city-selector')).tap();
        try { await element(by.text('İstanbul')).tap(); } catch (e) { }
        await element(by.id('address-district-selector')).tap();
        try { await element(by.text('Kadıköy')).tap(); } catch (e) { }
        await element(by.id('address-neighborhood-selector')).tap();
        try { await element(by.text('Caferağa Mh.')).tap(); } catch (e) { }
        await element(by.id('address-street-input')).typeText('Persist St.');
        await element(by.id('address-building-input')).typeText('1');
        await element(by.id('address-door-input')).typeText('1');
        await element(by.id('create-request-submit-button')).tap();
        await element(by.text('OK')).tap();

        // 3. Verify Data Exists
        await element(by.id('tab-requests')).tap();
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
            await element(by.text('Logout')).tap();
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
        await element(by.id('signin-button')).tap();

        // 6. Verify Data Persists
        await element(by.id('tab-requests')).tap();
        await expect(element(by.text(requestTitle))).toBeVisible();
    });
});
