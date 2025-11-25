describe('Volunteer for a Request', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should successfully volunteer for a request', async () => {
        // --- Step 1: Register User A (Creator) ---
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const creatorUsername = `creator${timestamp}`;
        const creatorEmail = `creator${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Creator User');
        await element(by.id('signup-username-input')).typeText(creatorUsername);
        await element(by.id('signup-phone-input')).typeText('1111111111');
        await element(by.id('signup-email-input')).typeText(creatorEmail);
        await element(by.id('signup-password-input')).typeText(password);
        await element(by.id('signup-password-input')).tapReturnKey();
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();
        await element(by.text('OK')).tap();

        // Login as Creator
        await element(by.id('signin-email-input')).typeText(creatorEmail);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();
        await element(by.id('signin-button')).tap();

        // Verify Feed
        try {
            // Wait for the search bar, giving time for the feed to load (API calls)
            await waitFor(element(by.id('feed-search-bar'))).toBeVisible().withTimeout(35000);
        } catch (e) {
            // Check for Login Failed alert
            try {
                await expect(element(by.text('Login Failed'))).toBeVisible();
                throw new Error('Login failed with alert');
            } catch (loginError) {
                // Check for Feed Load Error alert
                try {
                    await expect(element(by.text('Error'))).toBeVisible();
                    await expect(element(by.text('Failed to load tasks. Please try again.'))).toBeVisible();
                    throw new Error('Feed failed to load tasks');
                } catch (feedError) {
                    throw e;
                }
            }
        }


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

        // --- Step 3: Logout ---
        await element(by.id('feed-settings-button')).tap();
        await element(by.id('settings-logout-button')).tap();
        await element(by.text('Confirm')).tap(); // Confirm alert

        // --- Step 4: Register User B (Volunteer) ---
        await element(by.id('landing-register-button')).tap();

        const volunteerUsername = `volunteer${timestamp}`;
        const volunteerEmail = `volunteer${timestamp}@example.com`;

        await element(by.id('signup-fullname-input')).typeText('Volunteer User');
        await element(by.id('signup-username-input')).typeText(volunteerUsername);
        await element(by.id('signup-phone-input')).typeText('2222222222');
        await element(by.id('signup-email-input')).typeText(volunteerEmail);
        await element(by.id('signup-password-input')).typeText(password);
        await element(by.id('signup-password-input')).tapReturnKey();
        await element(by.id('signup-terms-checkbox')).tap();
        await element(by.id('signup-button')).tap();
        await element(by.text('OK')).tap();

        // Login as Volunteer
        await element(by.id('signin-email-input')).typeText(volunteerEmail);
        await element(by.id('signin-password-input')).typeText(password);
        await element(by.text('Welcome Back!')).tap();
        await element(by.id('signin-button')).tap();

        // --- Step 5: Volunteer for the Request ---
        // Go to Requests tab
        await element(by.id('tab-requests')).tap();

        // Find the request by scrolling (more reliable than search)
        await waitFor(element(by.text(`Volunteer Test Request ${timestamp}`)))
            .toBeVisible()
            .whileElement(by.id('requests-list'))
            .scroll(500, 'down');

        await element(by.text(`Volunteer Test Request ${timestamp}`)).tap();

        // Verify we are on details page
        await expect(element(by.id('request-details-title'))).toBeVisible();
        await expect(element(by.text(`Volunteer Test Request ${timestamp}`))).toBeVisible();

        // Tap Volunteer
        await element(by.id('volunteer-button')).tap();

        // Verify Success
        await expect(element(by.text('Success'))).toBeVisible();
        await element(by.text('OK')).tap();

        // Verify status changed (e.g., button changed to Withdraw or status text)
        await expect(element(by.id('withdraw-volunteer-button'))).toBeVisible();
    });
});
