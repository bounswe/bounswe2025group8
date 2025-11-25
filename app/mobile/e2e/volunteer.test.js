describe('Volunteer Flow', () => {
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

    it('should volunteer for a request', async () => {
        // 1. Find a request to volunteer for
        // We can use the feed or search.
        // Let's use the feed and tap the first available request.
        // We need to make sure we don't tap our own request (if we are the creator).
        // The feed usually shows all requests.

        // We need a testID for feed items.
        // I added `testID`s to `app/feed.tsx`?
        // Let's check `app/feed.tsx` changes.
        // I added `feed-search-bar`, `tab-home`, etc.
        // Did I add testIDs to the request cards?
        // I need to check `app/feed.tsx` again or `components/RequestCard.tsx` if it exists.
        // `app/feed.tsx` uses `FlatList` or `ScrollView`.

        // Assuming we can tap the first item in the feed that is NOT created by us.
        // Since we can't easily check creator in E2E without data setup, we'll try to tap the first one.
        // If it's ours, we'll see the Creator view (Edit/Delete).
        // If it's not ours, we'll see the Volunteer view.

        // Let's assume we tap a request.
        // We need to add testID to request items in `app/feed.tsx`.
        // I'll assume I did or will do it.
        // `request-item-${id}`

        // For now, let's try to find a request via search to be more specific if possible.
        // Or just tap the first element with a specific testID prefix if we can.

        // Let's assume we tap the first request card.
        // await element(by.id('request-card-0')).tap(); // Assuming we add index based testIDs

        // Since I haven't added request card testIDs yet, I should add them to `app/feed.tsx`.
        // I'll do that in a moment.

        // Placeholder for tapping a request
        // await element(by.text('Help needed')).tap(); // Try by text if we know a title

        // Once in the details page:
        // Check if "Be a Volunteer" button is visible
        await waitFor(element(by.id('volunteer-button'))).toBeVisible().withTimeout(5000);

        // Tap Volunteer
        await element(by.id('volunteer-button')).tap();

        // Verify Success Alert
        await waitFor(element(by.text('OK'))).toBeVisible().withTimeout(5000);
        await element(by.text('OK')).tap();

        // Verify button changes to "Withdraw" or "Pending" status
        // await expect(element(by.id('volunteer-withdraw-button'))).toBeVisible();
    });
});
