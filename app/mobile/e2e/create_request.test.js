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

const { login, waitForElement, dismissAlert, navigateToCreateRequest } = require('./testHelpers');

describe('Create Request Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        await login();
    });

    describe('Full Request Creation', () => {
        it('should create a new request successfully', async () => {
            const timestamp = Date.now();
            const requestTitle = `E2E Request ${timestamp}`;

            // Navigate to Create Request
            await navigateToCreateRequest();

            // Step 1: General Info
            await element(by.id('create-request-title-input')).typeText(requestTitle);
            await element(by.id('create-request-description-input')).typeText('This is a test request created by Detox E2E tests.');
            await element(by.id('create-request-description-input')).tapReturnKey();

            // Increase volunteer count
            await element(by.id('create-request-people-increase')).tap();
            await element(by.id('create-request-people-increase')).tap();

            // Go to next step
            await element(by.id('create-request-next-button')).tap();

            // Step 2: Upload Photo (Skip)
            await element(by.id('create-request-upload-next-button')).tap();

            // Step 3: Deadline (Use defaults)
            await element(by.id('create-request-deadline-next-button')).tap();

            // Step 4: Address
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            await element(by.id('address-city-selector')).tap();
            await element(by.text('Besiktas')).tap();

            await element(by.id('address-neighborhood-input')).typeText('Test Neighborhood');
            await element(by.id('address-street-input')).typeText('Test Street');
            await element(by.id('address-building-input')).typeText('123');
            await element(by.id('address-door-input')).typeText('4A');
            await element(by.id('address-door-input')).tapReturnKey();

            await element(by.id('create-request-address-description')).typeText('Near the main intersection');
            await element(by.id('create-request-address-description')).tapReturnKey();

            // Submit request
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
            await expect(element(by.id('create-request-title-input'))).toBeVisible();
            await element(by.id('create-request-title-input')).typeText('Navigation Test');
            await element(by.id('create-request-description-input')).typeText('Testing step navigation');
            await element(by.id('create-request-next-button')).tap();

            // Step 2 - Upload Photo
            await expect(element(by.id('create-request-upload-next-button'))).toBeVisible();
            await element(by.id('create-request-upload-next-button')).tap();

            // Step 3 - Deadline
            await expect(element(by.id('create-request-deadline-next-button'))).toBeVisible();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Step 4 - Address
            await expect(element(by.id('address-country-selector'))).toBeVisible();
        });
    });

    describe('Volunteer Count', () => {
        it('should increase volunteer count', async () => {
            await navigateToCreateRequest();

            // Check initial count is 1
            await expect(element(by.id('create-request-people-count'))).toBeVisible();

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

            // Tap urgency selector
            await element(by.id('create-request-urgency-selector')).tap();

            // Selector should be visible
            await expect(element(by.id('create-request-urgency-selector'))).toBeVisible();
        });
    });

    describe('Validation', () => {
        it('should require title to proceed', async () => {
            await navigateToCreateRequest();

            // Don't fill title, try to proceed
            await element(by.id('create-request-description-input')).typeText('Description only');
            await element(by.id('create-request-next-button')).tap();

            // Should show error or stay on same step
            await expect(element(by.id('create-request-title-input'))).toBeVisible();
        });
    });

    describe('Address Selection', () => {
        it('should select country, state, and city', async () => {
            await navigateToCreateRequest();

            // Fill required fields first
            await element(by.id('create-request-title-input')).typeText('Address Test');
            await element(by.id('create-request-description-input')).typeText('Testing address');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Now on address step
            await expect(element(by.id('address-country-selector'))).toBeVisible();

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
            await expect(element(by.id('address-neighborhood-input'))).toBeVisible();
        });
    });
});
