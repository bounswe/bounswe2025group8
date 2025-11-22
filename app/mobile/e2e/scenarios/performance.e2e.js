describe('Performance under Typical Usage', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should handle a typical user session without issues', async () => {
        // 1. Login
        await element(by.id('landing-login-button')).tap();

        // Register new user for clean session
        await element(by.text('Back')).tap();
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const username = `perfuser${timestamp}`;
        const email = `perfuser${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Perf User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('8888888888');
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

        // 2. Scroll Feed
        await expect(element(by.id('feed-scroll-view'))).toBeVisible();
        await element(by.id('feed-scroll-view')).scroll(500, 'down');
        await element(by.id('feed-scroll-view')).scroll(500, 'up');

        // 3. Navigate to Categories and Back
        await element(by.text('Categories')).atIndex(0).tap();
        await expect(element(by.id('category-search-bar'))).toBeVisible();
        await element(by.text('Home')).atIndex(0).tap();

        // 4. Navigate to Requests and Back
        await element(by.id('tab-requests')).tap();
        // Tap first request
        // Assuming there is at least one request (from previous tests or mock)
        // If not, create one first?
        // Let's create one to be sure and also test creation performance.

        // --- Step 2: Create a Request ---
        await element(by.id('tab-create')).tap();
        await element(by.id('create-request-title-input')).typeText(`Volunteer Test Request ${timestamp}`);
        await element(by.id('create-request-description-input')).typeText('This request is for testing volunteer flow.');
        await element(by.text('General Information')).tap();
        await element(by.id('create-request-next-button')).tap();
        await element(by.id('upload-photo-next-button')).tap();

        // Select Date/Time: Next Day (Test Helper)
        await element(by.id('set-next-day-button')).tap();
        // Tap somewhere to close picker if needed, or just proceed. 
        // On iOS inline picker might stay open but next button is visible.
        // If it was a modal, we'd need to confirm. Here it's inline/default.

        await element(by.id('deadline-next-button')).tap();

        // Address
        await element(by.id('address-city-selector')).tap();
        // Select City: Adana
        // Wait for the modal option to be visible. We might need to scroll.
        // 'Adana' should be near the top, but we use scrolling to be safe and robust.
        await waitFor(element(by.id('address-option-Adana')))
            .toBeVisible()
            .whileElement(by.id('address-picker-scrollview'))
            .scroll(500, 'down');

        await element(by.id('address-option-Adana')).tap();

        await element(by.id('address-district-selector')).tap();
        await waitFor(element(by.id('address-option-Kozan')))
            .toBeVisible()
            .whileElement(by.id('address-picker-scrollview'))
            .scroll(500, 'down');
        await element(by.id('address-option-Kozan')).tap();

        await element(by.id('address-neighborhood-selector')).tap();
        await waitFor(element(by.id('address-option-Gazi Mah')))
            .toBeVisible()
            .whileElement(by.id('address-picker-scrollview'))
            .scroll(500, 'down');
        await element(by.id('address-option-Gazi Mah')).tap();

        await element(by.id('address-street-input')).typeText('Test St.');
        await element(by.text('Setup Address')).tap();
        await element(by.id('address-building-input')).typeText('1');
        await element(by.text('Setup Address')).tap();
        await element(by.id('address-door-input')).typeText('1');
        await element(by.text('Setup Address')).tap();
        await element(by.id('create-request-submit-button')).tap();
        await element(by.text('OK')).tap();

        // 6. View the created request
        await element(by.id('tab-requests')).tap();
        await element(by.text(requestTitle)).tap();
        await expect(element(by.id('creator-request-title'))).toBeVisible();
        await element(by.id('creator-back-button')).tap();

        // 7. Logout
        await element(by.id('feed-settings-button')).tap();
        await element(by.id('settings-logout-button')).tap();
        await element(by.text('Logout')).tap();

        // Verify on Landing
        await expect(element(by.id('landing-login-button'))).toBeVisible();
    });
});
