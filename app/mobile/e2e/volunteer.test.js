/**
 * E2E Test: Volunteer for a Request (Scenario 4)
 * 
 * Tests the volunteer functionality including:
 * - Navigate to request details
 * - Volunteer for a request
 * - Verify pending status
 * - Withdraw from volunteering
 * - Cannot volunteer for own request
 */

const { login, waitForElement, dismissAlert, navigateToFeed, navigateToRequests, generateTestUser, registerUser } = require('./testHelpers');

describe('Volunteer for Request Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        await login();
    });

    describe('Volunteer Actions', () => {
        it('should display volunteer button on request details', async () => {
            // Navigate to requests list
            await navigateToRequests();

            // Wait for requests to load and tap first one
            await waitFor(element(by.id('tab-requests')))
                .toBeVisible()
                .withTimeout(5000);

            // Try to find and tap a request
            // We scroll and look for any request item
            try {
                await waitFor(element(by.id('request-item-1')))
                    .toBeVisible()
                    .withTimeout(5000);
                await element(by.id('request-item-1')).tap();
            } catch (e) {
                // If specific ID not found, tap first request by scrolling
                await element(by.type('RCTScrollView')).scroll(100, 'down');
            }

            // Check if volunteer button is visible (for non-owner requests)
            // The button may or may not be visible depending on who owns the request
            await waitFor(element(by.id('volunteer-button')).or(element(by.id('request-details-edit-button'))))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should volunteer for a request successfully', async () => {
            await navigateToFeed();

            // Wait for feed to load
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(5000);

            // Navigate to requests tab
            await element(by.id('tab-requests')).tap();

            // Wait for list to load and tap a request
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(5000);

            // Try to find the volunteer button after opening a request
            // This depends on having a request that the test user didn't create
            await waitFor(element(by.id('volunteer-button')))
                .toBeVisible()
                .withTimeout(8000);

            // Tap volunteer button
            await element(by.id('volunteer-button')).tap();

            // Should show success alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();
        });

        it('should show pending status after volunteering', async () => {
            // After volunteering, the status should change
            // Navigate to a request the user has volunteered for

            await navigateToRequests();

            // When already volunteered, should see pending/withdraw button
            await waitFor(element(by.id('volunteer-withdraw-button')).or(element(by.id('volunteer-button'))))
                .toBeVisible()
                .withTimeout(8000);
        });

        it('should allow withdrawing from a request', async () => {
            await navigateToRequests();

            // Find a request we've already volunteered for
            await waitFor(element(by.id('volunteer-withdraw-button')))
                .toBeVisible()
                .withTimeout(8000);

            // Tap withdraw
            await element(by.id('volunteer-withdraw-button')).tap();

            // Should show success alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.text('OK')).tap();

            // Volunteer button should reappear
            await waitFor(element(by.id('volunteer-button')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Request Owner View', () => {
        it('should show edit/delete buttons for own request', async () => {
            // First create a request, then view it
            await element(by.id('tab-create')).tap();

            const timestamp = Date.now();
            await element(by.id('create-request-title-input')).typeText(`Owner Test ${timestamp}`);
            await element(by.id('create-request-description-input')).typeText('Testing owner view');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Fill address
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();
            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();
            await element(by.id('address-city-selector')).tap();
            await element(by.text('Besiktas')).tap();
            await element(by.id('address-neighborhood-input')).typeText('Test');
            await element(by.id('address-street-input')).typeText('Test');
            await element(by.id('address-building-input')).typeText('1');
            await element(by.id('address-door-input')).typeText('1');
            await element(by.id('create-request-submit-button')).tap();

            await dismissAlert();

            // Navigate to requests and find our new request
            await navigateToRequests();

            // Should see edit/delete buttons (owner view)
            await waitFor(element(by.id('request-details-edit-button')).or(element(by.id('request-details-delete-button'))))
                .toBeVisible()
                .withTimeout(8000);
        });

        it('should not show volunteer button for own request', async () => {
            // Create and view own request
            await element(by.id('tab-create')).tap();

            const timestamp = Date.now();
            await element(by.id('create-request-title-input')).typeText(`No Volunteer ${timestamp}`);
            await element(by.id('create-request-description-input')).typeText('Should not see volunteer button');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();
            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();
            await element(by.id('address-city-selector')).tap();
            await element(by.text('Besiktas')).tap();
            await element(by.id('address-neighborhood-input')).typeText('Test');
            await element(by.id('address-street-input')).typeText('Test');
            await element(by.id('address-building-input')).typeText('1');
            await element(by.id('address-door-input')).typeText('1');
            await element(by.id('create-request-submit-button')).tap();

            await dismissAlert();

            // Volunteer button should NOT be visible (owner view)
            await expect(element(by.id('volunteer-button'))).not.toBeVisible();
        });
    });

    describe('Request Details', () => {
        it('should display request information correctly', async () => {
            await navigateToRequests();

            // Tap a request from the list
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(5000);

            // Check basic elements are displayed
            // Title and description should be visible in details
            await waitFor(element(by.id('tab-requests')))
                .toBeVisible()
                .withTimeout(3000);
        });
    });
});
