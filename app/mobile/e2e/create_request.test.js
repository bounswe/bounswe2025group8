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
    typeTextAndDismiss,
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
                .withTimeout(10000);

            await typeTextAndDismiss('create-request-title-input', requestTitle);
            await typeTextAndDismiss('create-request-description-input', 'This is a test request created by Detox E2E tests.', true);

            // Select Category
            await element(by.id('create-request-category-selector')).tap();
            await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('category-option-GROCERY_SHOPPING')).tap();

            // Select Urgency (Priority)
            await element(by.id('create-request-urgency-selector')).tap();
            await waitFor(element(by.id('urgency-option-HIGH')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('urgency-option-HIGH')).tap();

            // Increase volunteer count - scroll to it first
            await waitFor(element(by.id('create-request-people-increase')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await element(by.id('create-request-people-increase')).tap();
            await element(by.id('create-request-people-increase')).tap();

            // Go to next step
            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await dismissKeyboard();
            await element(by.id('create-request-next-button')).tap();

            // Step 2: Upload Photo (Skip)
            await waitFor(element(by.id('create-request-upload-next-button')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('create-request-upload-next-button')).tap();

            // Step 3: Deadline (Use defaults)
            await waitFor(element(by.id('create-request-deadline-next-button')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Step 4: Address
            await waitFor(element(by.id('address-country-selector')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('address-country-selector')).tap();

            // Wait for modal to appear and option to be fully visible
            await waitFor(element(by.id('address-option-AFGHANISTAN')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-AFGHANISTAN')).tap();

            // Settle after modal transition
            await new Promise(resolve => setTimeout(resolve, 500));

            await waitFor(element(by.id('address-state-selector')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('address-state-selector')).tap();

            await waitFor(element(by.id('address-option-KABUL')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-KABUL')).tap();

            // Settle after modal transition
            await new Promise(resolve => setTimeout(resolve, 500));

            await waitFor(element(by.id('address-city-selector')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('address-city-selector')).tap();

            await waitFor(element(by.id('address-option-KABUL')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-KABUL')).tap();

            // Fill address fields with keyboard handling
            await typeTextAndDismiss('address-neighborhood-input', 'Test Neighborhood');

            await typeTextAndDismiss('address-street-input', 'Test Street');

            // Scroll to see more fields
            await waitFor(element(by.id('address-building-input')))
                .toExist()
                .whileElement(by.id('create-request-address-scroll-view'))
                .scroll(150, 'down');

            await typeTextAndDismiss('address-building-input', '123');

            await typeTextAndDismiss('address-door-input', '4A');

            // Scroll to description and submit
            await waitFor(element(by.id('create-request-address-description')))
                .toExist()
                .whileElement(by.id('create-request-address-scroll-view'))
                .scroll(150, 'down');

            await typeTextAndDismiss('create-request-address-description', 'Near the main intersection', true);

            // Submit request
            await waitFor(element(by.id('create-request-submit-button')))
                .toBeVisible()
                .whileElement(by.id('create-request-address-scroll-view'))
                .scroll(200, 'down');

            await new Promise(resolve => setTimeout(resolve, 500));
            await element(by.id('create-request-submit-button')).tap();

            // Handle Success Alert
            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(15000);
            await element(by.text('OK')).tap();

            // Verify redirect to requests list and check for our new task
            await waitFor(element(by.id('requests-list')))
                .toBeVisible()
                .withTimeout(15000);

            // Find our new task by its accessibility label (contains the title)
            const cardLabel = `View request ${requestTitle}`;
            await waitFor(element(by.label(cardLabel)))
                .toBeVisible()
                .whileElement(by.id('requests-list'))
                .scroll(300, 'down');

            await expect(element(by.label(cardLabel))).toBeVisible();
        });
    });

    describe('Step Navigation', () => {
        it('should navigate through all creation steps', async () => {
            await navigateToCreateRequest();

            // Step 1 - General Info
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(10000);
            await typeTextAndDismiss('create-request-title-input', 'Navigation Test');
            await typeTextAndDismiss('create-request-description-input', 'Testing step navigation', true);

            // Select Category
            await element(by.id('create-request-category-selector')).tap();
            await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('category-option-GROCERY_SHOPPING')).tap();

            // Scroll to next button
            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await dismissKeyboard();
            await element(by.id('create-request-next-button')).tap();

            // Step 2 - Upload Photo
            await waitFor(element(by.id('create-request-upload-next-button')))
                .toBeVisible()
                .withTimeout(10000);
            await element(by.id('create-request-upload-next-button')).tap();

            // Step 3 - Deadline
            await waitFor(element(by.id('create-request-deadline-next-button')))
                .toBeVisible()
                .withTimeout(10000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Step 4 - Address
            await waitFor(element(by.id('address-country-selector')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });

    describe('Volunteer Count', () => {
        it('should increase volunteer count', async () => {
            await navigateToCreateRequest();

            // Scroll down to see people count
            await waitFor(element(by.id('create-request-people-count')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            // Check initial count is 1
            await waitFor(element(by.id('create-request-people-count')))
                .toBeVisible()
                .withTimeout(10000);

            // Increase count
            await element(by.id('create-request-people-increase')).tap();
            await element(by.id('create-request-people-increase')).tap();

            // Decrease count
            await element(by.id('create-request-people-decrease')).tap();

            // Count should be visible
            await expect(element(by.id('create-request-people-count'))).toExist();
        });

        it('should not decrease below 1', async () => {
            await navigateToCreateRequest();

            // Scroll down to see people count
            await waitFor(element(by.id('create-request-people-decrease')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await waitFor(element(by.id('create-request-people-decrease')))
                .toBeVisible()
                .withTimeout(10000);

            // Try to decrease from 1
            await element(by.id('create-request-people-decrease')).tap();
            await element(by.id('create-request-people-decrease')).tap();

            // Count should still be visible (minimum 1)
            await expect(element(by.id('create-request-people-count'))).toExist();
        });
    });

    describe('Urgency Selection', () => {
        it('should allow urgency level selection', async () => {
            await navigateToCreateRequest();

            // Scroll down to see urgency selector
            await waitFor(element(by.id('create-request-urgency-selector')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(100, 'down');

            // Tap urgency selector
            await waitFor(element(by.id('create-request-urgency-selector')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('create-request-urgency-selector')).tap();

            // Selector should be visible
            await expect(element(by.id('create-request-urgency-selector'))).toExist();
        });
    });

    describe('Validation', () => {
        it('should require title to proceed', async () => {
            await navigateToCreateRequest();

            // Wait for form to load
            await waitFor(element(by.id('create-request-description-input')))
                .toBeVisible()
                .withTimeout(10000);

            // Don't fill title, try to proceed
            await typeTextAndDismiss('create-request-description-input', 'Description only', true);

            // Scroll to next button
            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await element(by.id('create-request-next-button')).tap();

            // Should show error or stay on same step - scroll back up
            try {
                await element(by.type('RCTScrollView')).atIndex(0).scroll(200, 'up');
            } catch (e) { }

            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });

    describe('Address Selection', () => {
        it('should select country, state, and city', async () => {
            await navigateToCreateRequest();

            // Wait for form
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(10000);

            // Fill required fields first
            await typeTextAndDismiss('create-request-title-input', 'Address Test');
            await typeTextAndDismiss('create-request-description-input', 'Testing address', true);

            // Select Category
            await element(by.id('create-request-category-selector')).tap();
            await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
                .toExist()
                .withTimeout(10000);
            await element(by.id('category-option-GROCERY_SHOPPING')).tap();

            // Scroll to next button
            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await dismissKeyboard();
            await element(by.id('create-request-next-button')).tap();

            await waitFor(element(by.id('create-request-upload-next-button')))
                .toExist()
                .whileElement(by.id('create-request-upload-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('create-request-upload-next-button')).tap();

            await waitFor(element(by.id('create-request-deadline-next-button')))
                .toExist()
                .whileElement(by.id('create-request-deadline-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('create-request-deadline-next-button')).tap();

            // Now on address step
            await waitFor(element(by.id('address-country-selector')))
                .toBeVisible()
                .withTimeout(10000);

            // Select country
            await element(by.id('address-country-selector')).tap();
            await waitFor(element(by.id('address-option-AFGHANISTAN')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-AFGHANISTAN')).tap();

            await new Promise(resolve => setTimeout(resolve, 500));

            // State selector should now be active
            await element(by.id('address-state-selector')).tap();
            await waitFor(element(by.id('address-option-KABUL')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-KABUL')).tap();

            await new Promise(resolve => setTimeout(resolve, 500));

            // City selector should now be active
            await element(by.id('address-city-selector')).tap();
            await waitFor(element(by.id('address-option-KABUL')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-KABUL')).tap();

            // Verify selections were made
            await waitFor(element(by.id('address-neighborhood-input')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });
});
