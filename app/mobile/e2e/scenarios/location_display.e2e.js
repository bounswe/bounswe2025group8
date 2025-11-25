describe('Location Display', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should display location correctly in request details', async () => {
        // 1. Login
        await element(by.id('landing-login-button')).tap();

        // Register new user
        await element(by.text('Back')).tap();
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const username = `locuser${timestamp}`;
        const email = `locuser${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Location User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('4444444444');
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

        // Verify Feed
        await expect(element(by.id('feed-search-bar'))).toBeVisible();

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


        // 3. Find the request in Feed/Requests
        // It should be the top one in Requests tab
        await element(by.id('tab-requests')).tap();
        await waitFor(element(by.text(`Volunteer Test Request ${timestamp}`)))
            .toBeVisible()
            .whileElement(by.id('requests-list'))
            .scroll(500, 'down');
        await element(by.text(`Volunteer Test Request ${timestamp}`)).tap();

        // 4. Verify Location Display
        await expect(element(by.id('location-display'))).toBeVisible();
        // The location format depends on how backend/frontend formats it.
        // Usually "District, City" or full address.
        // Based on `requests.tsx` it shows `task.location`.
        // Let's verify it contains "İstanbul" or "Kadıköy".
        // Detox `toHaveText` is exact match usually, but we can check if it's visible.
        // Or we can try to match by text inside the element.
        // Since `DetailRow` has text inside, we can check if `location-display` contains text.
        // Note: `toHaveText` checks for exact text on the element. 
        // If `DetailRow` is a View containing Text, `toHaveText` might not work directly on the View unless accessible.
        // But we added `testID` to the `View`.
        // We should probably check for text existence inside it.
        // Or we can just check `element(by.text('İstanbul, Kadıköy, Caferağa Mh., Loc St. No: 5 Daire: 2'))` (or whatever format) is visible.
        // But we don't know the exact format without checking backend response.
        // Let's just check if `location-display` is visible, which confirms the row is there.
        // And maybe check if "İstanbul" is visible on screen.
        const expectedAddress = 'Moda Cd., 10 5, Gazi Mah, Kozan, Adana';
        await expect(element(by.text(expectedAddress))).toBeVisible();
    });
});
