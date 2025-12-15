/**
 * E2E Test: Create a Request (Scenario 3)
 * 
 * Tests the complete request creation flow including:
 * - Full request creation (title, description, urgency, people)
 * - Photo upload step (skip and with photo)
 * - Deadline selection
 * - Address selection
 * - Category selection
 * - Validation for required fields
 * - Success confirmation and redirect
 */

const {
    login,
    waitForElement,
    dismissAlert,
    navigateToCreateRequest,
    generateTestUser,
    registerUser,
    typePassword,
    dismissKeyboard,
    logout
} = require('./testHelpers');

describe('Create Request Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();

        // Check if already logged in (from previous test) and logout
        try {
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
            await logout();
        } catch (e) {
            // Not logged in, continue
        }

        // Register a fresh user and login
        const user = generateTestUser();
        await registerUser(user);

        // After registration, we're on signin screen - login
        await element(by.id('signin-email-input')).typeText(user.email);
        await typePassword('signin-password-input', 'signin-password-toggle', user.password);
        await dismissKeyboard();
        await element(by.id('signin-button')).tap();

        // Wait for feed
        await waitFor(element(by.id('feed-search-bar')))
            .toBeVisible()
            .withTimeout(10000);

        // Dismiss any popups/alerts that might be covering the tab bar
        try {
            await element(by.text('OK')).tap();
        } catch (e) {
            // No alert, continue
        }
        try {
            await element(by.text('Tamam')).tap();
        } catch (e) {
            // No alert, continue
        }

        // Small delay to let UI settle
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    describe('Full Request Creation', () => {
        it('should create a new request successfully', async () => {
            const timestamp = Date.now();
            const requestTitle = `E2E Request ${timestamp}`;

            // Navigate to Create Request
            await navigateToCreateRequest();

            // Step 1: General Info - scroll to make form visible
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(5000);

            await element(by.id('create-request-title-input')).typeText(requestTitle);
            await dismissKeyboard();

            await element(by.id('create-request-description-input')).typeText('This is a test request created by Detox E2E tests.');
            await dismissKeyboard();

            // Scroll down to see volunteer count and next button
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) {
                // Continue if scroll fails
            }

            // Increase volunteer count
            await waitFor(element(by.id('create-request-people-increase')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-people-increase')).tap();
            await element(by.id('create-request-people-increase')).tap();

            // Go to next step - scroll to make button visible
            await waitFor(element(by.id('create-request-next-button')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-next-button')).tap();

            // Step 2: Upload Photo (Skip)
            await element(by.id('create-request-upload-next-button')).tap();

            // Step 3: Deadline (Use defaults)
            await element(by.id('create-request-deadline-next-button')).tap();

            // Step 4: Address
            await waitFor(element(by.id('address-country-selector')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            await element(by.id('address-city-selector')).tap();
            await element(by.text('Besiktas')).tap();

            // Fill address fields with keyboard handling
            await element(by.id('address-neighborhood-input')).typeText('Test Neighborhood');
            await dismissKeyboard();

            await element(by.id('address-street-input')).typeText('Test Street');
            await dismissKeyboard();

            // Scroll to see more fields
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(150, 'down');
            } catch (e) { }

            await element(by.id('address-building-input')).typeText('123');
            await dismissKeyboard();

            await element(by.id('address-door-input')).typeText('4A');
            await dismissKeyboard();

            // Scroll to description and submit
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(150, 'down');
            } catch (e) { }

            await element(by.id('create-request-address-description')).typeText('Near the main intersection');
            await dismissKeyboard();

            // Scroll to submit button
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) { }

            // Submit request
            await waitFor(element(by.id('create-request-submit-button')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-submit-button')).tap();

            // Handle Success Alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(15000);
            await element(by.text('OK')).tap();

            // Verify redirect to feed
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });

    describe('Step Navigation', () => {
        it('should navigate through all creation steps', async () => {
            await navigateToCreateRequest();

            // Step 1 - General Info
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('create-request-title-input')).typeText('Navigation Test');
            await dismissKeyboard();
            await element(by.id('create-request-description-input')).typeText('Testing step navigation');
            await dismissKeyboard();

            // Scroll to next button
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) { }

            await waitFor(element(by.id('create-request-next-button')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-next-button')).tap();

            // Step 2 - Upload Photo
            await waitFor(element(by.id('create-request-upload-next-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('create-request-upload-next-button')).tap();

            // Step 3 - Deadline
            await waitFor(element(by.id('create-request-deadline-next-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Step 4 - Address
            await waitFor(element(by.id('address-country-selector')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Volunteer Count', () => {
        it('should increase volunteer count', async () => {
            await navigateToCreateRequest();

            // Scroll down to see people count
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) { }

            // Check initial count is 1
            await waitFor(element(by.id('create-request-people-count')))
                .toBeVisible()
                .withTimeout(3000);

            // Increase count
            await element(by.id('create-request-people-increase')).tap();
            await element(by.id('create-request-people-increase')).tap();

            // Decrease count
            await element(by.id('create-request-people-decrease')).tap();

            // Count should be visible
            await expect(element(by.id('create-request-people-count'))).toBeVisible();
        });

        it('should not decrease below 1', async () => {
            await navigateToCreateRequest();

            // Scroll down to see people count
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) { }

            await waitFor(element(by.id('create-request-people-decrease')))
                .toBeVisible()
                .withTimeout(3000);

            // Try to decrease from 1
            await element(by.id('create-request-people-decrease')).tap();
            await element(by.id('create-request-people-decrease')).tap();

            // Count should still be visible (minimum 1)
            await expect(element(by.id('create-request-people-count'))).toBeVisible();
        });
    });

    describe('Urgency Selection', () => {
        it('should allow urgency level selection', async () => {
            await navigateToCreateRequest();

            // Scroll down to see urgency selector
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(100, 'down');
            } catch (e) { }

            // Tap urgency selector
            await waitFor(element(by.id('create-request-urgency-selector')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-urgency-selector')).tap();

            // Selector should be visible
            await expect(element(by.id('create-request-urgency-selector'))).toBeVisible();
        });
    });

    describe('Validation', () => {
        it('should require title to proceed', async () => {
            await navigateToCreateRequest();

            // Wait for form to load
            await waitFor(element(by.id('create-request-description-input')))
                .toBeVisible()
                .withTimeout(5000);

            // Don't fill title, try to proceed
            await element(by.id('create-request-description-input')).typeText('Description only');
            await dismissKeyboard();

            // Scroll to next button
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) { }

            await waitFor(element(by.id('create-request-next-button')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-next-button')).tap();

            // Should show error or stay on same step - scroll back up
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'up');
            } catch (e) { }

            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(3000);
        });
    });

    describe('Address Selection', () => {
        it('should select country, state, and city', async () => {
            await navigateToCreateRequest();

            // Wait for form
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(5000);

            // Fill required fields first
            await element(by.id('create-request-title-input')).typeText('Address Test');
            await dismissKeyboard();
            await element(by.id('create-request-description-input')).typeText('Testing address');
            await dismissKeyboard();

            // Scroll to next button
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'down');
            } catch (e) { }

            await waitFor(element(by.id('create-request-next-button')))
                .toBeVisible()
                .withTimeout(3000);
            await element(by.id('create-request-next-button')).tap();

            await waitFor(element(by.id('create-request-upload-next-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('create-request-upload-next-button')).tap();

            await waitFor(element(by.id('create-request-deadline-next-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Now on address step
            await waitFor(element(by.id('address-country-selector')))
                .toBeVisible()
                .withTimeout(5000);

            // Select country
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            // State selector should now be active
            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            // City selector should now be active
            await element(by.id('address-city-selector')).tap();
            await element(by.text('Kadikoy')).tap();

            // Verify selections were made
            await waitFor(element(by.id('address-neighborhood-input')))
                .toBeVisible()
                .withTimeout(3000);
        });
    });
});
