describe('Authentication and Role Enforcement', () => {
    beforeAll(async () => {
        jest.setTimeout(300000);
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should enforce creator and volunteer roles', async () => {
        // --- Step 1: Register User A (Creator) ---
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const creatorUsername = `authcreator${timestamp}`;
        const creatorEmail = `authcreator${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Auth Creator');
        await element(by.id('signup-username-input')).typeText(creatorUsername);
        await element(by.id('signup-phone-input')).typeText('5555555555');
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

        // Verify Creator View
        const requestTitle = `Volunteer Test Request ${timestamp}`;
        await element(by.id('tab-requests')).tap();
        await waitFor(element(by.text(requestTitle)))
            .toBeVisible()
            .whileElement(by.id('requests-list'))
            .scroll(500, 'down');
        await element(by.text(requestTitle)).tap();

        // Should see Creator options
        await waitFor(element(by.id('creator-edit-button')))
            .toBeVisible()
            .whileElement(by.id('request-details-scroll-view')) // Assuming the details page is scrollable and has this ID, or we use the main view
            .scroll(100, 'down');
        await expect(element(by.id('creator-edit-button'))).toBeVisible();
        await expect(element(by.id('creator-delete-button'))).toBeVisible();

        // Go back and Logout
        await element(by.id('creator-back-button')).tap();
        await element(by.id('feed-settings-button')).tap();
        await element(by.id('settings-logout-button')).tap();
        await element(by.text('Confirm')).tap(); // Confirm alert

        // --- Step 2: Register User B (Volunteer) ---
        await element(by.id('landing-register-button')).tap();

        const volunteerUsername = `authvolunteer${timestamp}`;
        const volunteerEmail = `authvolunteer${timestamp}@example.com`;

        await element(by.id('signup-fullname-input')).typeText('Auth Volunteer');
        await element(by.id('signup-username-input')).typeText(volunteerUsername);
        await element(by.id('signup-phone-input')).typeText('6666666666');
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

        // Verify Volunteer View
        await element(by.id('tab-requests')).tap();
        await waitFor(element(by.text(`Volunteer Test Request ${timestamp}`)))
            .toBeVisible()
            .whileElement(by.id('requests-list'))
            .scroll(500, 'down');
        await element(by.text(`Volunteer Test Request ${timestamp}`)).tap();

        // Should see Volunteer options (Volunteer button)
        await expect(element(by.id('volunteer-button'))).toBeVisible();

        // Should NOT see Creator options
        await expect(element(by.id('creator-edit-button'))).not.toBeVisible();
        await expect(element(by.id('creator-delete-button'))).not.toBeVisible();
    });
});
