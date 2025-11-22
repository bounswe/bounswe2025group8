describe('Authentication and Role Enforcement', () => {
    beforeAll(async () => {
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

        // Create Request
        await element(by.text('Create')).tap();
        const requestTitle = `Auth Role Test ${timestamp}`;
        await element(by.id('create-request-title-input')).typeText(requestTitle);
        await element(by.id('create-request-description-input')).typeText('Role enforcement test.');
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
        await element(by.id('address-street-input')).typeText('Role St.');
        await element(by.id('address-building-input')).typeText('1');
        await element(by.id('address-door-input')).typeText('1');
        await element(by.id('create-request-submit-button')).tap();
        await element(by.text('OK')).tap();

        // Verify Creator View
        await element(by.id('tab-requests')).tap();
        await element(by.text(requestTitle)).tap();

        // Should see Creator options
        await expect(element(by.id('creator-edit-button'))).toBeVisible();
        await expect(element(by.id('creator-delete-button'))).toBeVisible();

        // Go back and Logout
        await element(by.id('creator-back-button')).tap();
        await element(by.id('feed-settings-button')).tap();
        await element(by.id('settings-logout-button')).tap();
        await element(by.text('Logout')).tap();

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
        await element(by.id('signin-button')).tap();

        // Verify Volunteer View
        await element(by.id('tab-requests')).tap();
        await element(by.text(requestTitle)).tap();

        // Should see Volunteer options (Volunteer button)
        await expect(element(by.id('volunteer-button'))).toBeVisible();

        // Should NOT see Creator options
        await expect(element(by.id('creator-edit-button'))).not.toBeVisible();
        await expect(element(by.id('creator-delete-button'))).not.toBeVisible();
    });
});
