describe('Filter Requests by Category', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should filter requests by category', async () => {
        // 1. Login
        await element(by.id('landing-login-button')).tap();

        // Use a known user or register a new one. 
        // Let's register a new one to be safe and clean.
        await element(by.text('Back')).tap();
        await element(by.id('landing-register-button')).tap();

        const timestamp = new Date().getTime();
        const username = `filteruser${timestamp}`;
        const email = `filteruser${timestamp}@example.com`;
        const password = 'Password123!';

        await element(by.id('signup-fullname-input')).typeText('Filter User');
        await element(by.id('signup-username-input')).typeText(username);
        await element(by.id('signup-phone-input')).typeText('3333333333');
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

        // 2. Navigate to Categories
        // We need to find the Categories tab. 
        // In feed.tsx, we added testID="tab-categories" to the Categories tab?
        // Wait, I added it to `categories.tsx` but `feed.tsx` also has the bottom bar.
        // I need to check if I added it to `feed.tsx`.
        // I checked `feed.tsx` in previous step, but I only added `tab-requests`.
        // I should add `tab-categories` to `feed.tsx` as well.
        // Or I can use the "Categories" text to tap.
        await element(by.text('Categories')).atIndex(0).tap(); // There might be multiple "Categories" text (header and tab)

        // 3. Select a Category
        // We need to tap a category. 
        // Let's assume there is at least one category.
        // We added testID `category-row-${cat.id}`.
        // Since we don't know the ID, we can try to tap the first element with that testID pattern?
        // Detox doesn't support regex matchers easily.
        // We can tap by text if we know a category name.
        // "Grocery Shopping", "Health", "Transportation" are common.
        // Let's try to tap the first available category row using a more generic matcher if possible, or just "Grocery Shopping".
        // Or we can tap the first child of the scroll view?
        // Let's try to find by text "Grocery Shopping". If it fails, the test fails, which is fair if no data.
        // But to be safer, let's create a request with a specific category first?
        // That would ensure the category exists.
        // Let's do that.

        // --- Step 2: Create a Request ---
        await element(by.id('tab-create')).tap();
        await element(by.id('create-request-title-input')).typeText(`Grocery Shopping Request ${timestamp}`);
        await element(by.id('create-request-description-input')).typeText('This request is for testing Grocery Shopping category.');


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

        // Now go to Categories
        await element(by.text('Categories')).atIndex(0).tap();

        // Tap "Grocery Shopping"
        await element(by.text('Grocery Shopping')).tap();

        // 4. Verify Category Page
        await expect(element(by.id('category-title'))).toHaveText('Grocery Shopping');

        // 5. Verify Request is listed (scroll to find it)
        await waitFor(element(by.text(`Grocery Shopping Request ${timestamp}`)))
            .toBeVisible()
            .whileElement(by.id('category-requests-scrollview'))
            .scroll(500, 'down');

        // 6. Tap Request
        await element(by.text(`Grocery Shopping Request ${timestamp}`)).tap();

        // Verify details (user is the creator, so it shows creator view)
        await expect(element(by.id('creator-request-title'))).toHaveText(`Grocery Shopping Request ${timestamp}`);
    });
});
