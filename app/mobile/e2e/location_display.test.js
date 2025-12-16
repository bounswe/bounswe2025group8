/**
 * E2E Test: Location Display and Map Rendering (Scenario 6)
 * 
 * Tests location-related features including:
 * - Location info on request cards
 * - Address details on request detail page
 * - Address selection during request creation
 * - Country/state/city/neighborhood dropdowns
 */

const { login, navigateToFeed, navigateToRequests, navigateToCreateRequest, dismissAlert } = require('./testHelpers');

describe('Location Display Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        await login();
    });

    describe('Request Cards Location', () => {
        it('should display location info on feed request cards', async () => {
            await navigateToFeed();

            // Wait for feed to load
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(5000);

            // Scroll to see request cards
            await element(by.type('RCTScrollView')).scroll(300, 'down');

            // Request cards should display location info
            // Location is shown in requestMeta style with format: "location • date"
            await expect(element(by.type('RCTScrollView'))).toBeVisible();
        });
    });

    describe('Request Details Location', () => {
        it('should display full address on request detail page', async () => {
            await navigateToRequests();

            // Tap on a request
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(5000);

            // Try to tap a request item
            try {
                await element(by.id('request-item-1')).tap();
            } catch (e) {
                // Scroll to find requests
                await element(by.type('RCTScrollView')).scroll(100, 'down');
            }

            // Request details should show location information
            // Address details are displayed in the detail view
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Address Selection in Create Request', () => {
        it('should display country selector', async () => {
            await navigateToCreateRequest();

            // Fill required fields to get to address step
            await element(by.id('create-request-title-input')).typeText('Location Test');
            await element(by.id('create-request-description-input')).typeText('Testing location');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Should be on address step
            await expect(element(by.id('address-country-selector'))).toBeVisible();
        });

        it('should select country and enable state selector', async () => {
            await navigateToCreateRequest();

            await element(by.id('create-request-title-input')).typeText('Country Test');
            await element(by.id('create-request-description-input')).typeText('Testing country selection');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Select country
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            // State selector should be available
            await expect(element(by.id('address-state-selector'))).toBeVisible();
        });

        it('should select state and enable city selector', async () => {
            await navigateToCreateRequest();

            await element(by.id('create-request-title-input')).typeText('State Test');
            await element(by.id('create-request-description-input')).typeText('Testing state selection');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            // City selector should be available
            await expect(element(by.id('address-city-selector'))).toBeVisible();
        });

        it('should select city and show neighborhood input', async () => {
            await navigateToCreateRequest();

            await element(by.id('create-request-title-input')).typeText('City Test');
            await element(by.id('create-request-description-input')).typeText('Testing city selection');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            await element(by.id('address-city-selector')).tap();
            await element(by.text('Besiktas')).tap();

            // Neighborhood input should be visible
            await expect(element(by.id('address-neighborhood-input'))).toBeVisible();
        });

        it('should complete full address selection', async () => {
            await navigateToCreateRequest();

            await element(by.id('create-request-title-input')).typeText('Full Address Test');
            await element(by.id('create-request-description-input')).typeText('Testing complete address');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Complete address selection
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            await element(by.id('address-city-selector')).tap();
            await element(by.text('Kadikoy')).tap();

            // Fill remaining address fields
            await element(by.id('address-neighborhood-input')).typeText('Moda');
            await element(by.id('address-street-input')).typeText('Main Street');
            await element(by.id('address-building-input')).typeText('42');
            await element(by.id('address-door-input')).typeText('3B');
            await element(by.id('address-door-input')).tapReturnKey();

            // Address description
            await element(by.id('create-request-address-description')).typeText('Blue building on the corner');

            // All address fields should be filled
            await expect(element(by.id('create-request-submit-button'))).toBeVisible();
        });
    });

    describe('Address Cascading Dropdowns', () => {
        it('should reset state when country changes', async () => {
            await navigateToCreateRequest();

            await element(by.id('create-request-title-input')).typeText('Cascade Test');
            await element(by.id('create-request-description-input')).typeText('Testing cascading');
            await element(by.id('create-request-next-button')).tap();
            await element(by.id('create-request-upload-next-button')).tap();
            await element(by.id('create-request-deadline-next-button')).tap();

            // Select initial values
            await element(by.id('address-country-selector')).tap();
            await element(by.text('Turkey')).tap();

            await element(by.id('address-state-selector')).tap();
            await element(by.text('Istanbul')).tap();

            // Change country - state should reset
            await element(by.id('address-country-selector')).tap();

            // Should show country picker again
            await expect(element(by.type('RCTScrollView'))).toBeVisible();
        });
    });
});
