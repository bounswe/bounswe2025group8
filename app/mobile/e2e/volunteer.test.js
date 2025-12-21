/**
 * E2E Test: Volunteer for a Request (Scenario 4)
 * 
 * Tests the volunteer functionality including:
 * - Volunteer for a request created by another user
 * - Verify volunteer/withdraw buttons on own vs other's requests
 */

const { registerUser, generateTestUser, typeTextAndDismiss, typePassword, logout, navigateToRequests, navigateToCreateRequest, dismissAlert, dismissKeyboard } = require('./testHelpers');

/**
 * Helper to create a request with the currently logged in user
 * @param {string} title - Request title
 */
const createTestRequest = async (title) => {
    await navigateToCreateRequest();

    await waitFor(element(by.id('create-request-title-input')))
        .toBeVisible()
        .withTimeout(10000);

    await typeTextAndDismiss('create-request-title-input', title);
    await typeTextAndDismiss('create-request-description-input', 'Test request for volunteer flow', true);

    // Select Category
    await element(by.id('create-request-category-selector')).tap();
    await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
        .toExist()
        .withTimeout(5000);
    await element(by.id('category-option-GROCERY_SHOPPING')).tap();

    // Scroll to next button
    await waitFor(element(by.id('create-request-next-button')))
        .toExist()
        .whileElement(by.id('create-request-scroll-view'))
        .scroll(150, 'down');

    await dismissKeyboard();
    await element(by.id('create-request-next-button')).tap();

    // Photo step - skip
    await waitFor(element(by.id('create-request-upload-next-button'))).toBeVisible().withTimeout(5000);
    await element(by.id('create-request-upload-next-button')).tap();

    // Deadline step - use defaults
    await waitFor(element(by.id('create-request-deadline-next-button'))).toBeVisible().withTimeout(5000);
    await element(by.id('create-request-deadline-next-button')).tap();

    // Address step - Afghanistan/Kabul
    await element(by.id('address-country-selector')).tap();
    await waitFor(element(by.id('address-option-AFGHANISTAN')))
        .toBeVisible()
        .whileElement(by.id('address-picker-scroll-view'))
        .scroll(100, 'down');
    await element(by.id('address-option-AFGHANISTAN')).tap();
    await new Promise(resolve => setTimeout(resolve, 500));

    await element(by.id('address-state-selector')).tap();
    await waitFor(element(by.id('address-option-KABUL')))
        .toBeVisible()
        .whileElement(by.id('address-picker-scroll-view'))
        .scroll(100, 'down');
    await element(by.id('address-option-KABUL')).tap();
    await new Promise(resolve => setTimeout(resolve, 500));

    await element(by.id('address-city-selector')).tap();
    await waitFor(element(by.id('address-option-KABUL')))
        .toBeVisible()
        .whileElement(by.id('address-picker-scroll-view'))
        .scroll(100, 'down');
    await element(by.id('address-option-KABUL')).tap();
    await new Promise(resolve => setTimeout(resolve, 500));

    await typeTextAndDismiss('address-neighborhood-input', 'Test');
    await typeTextAndDismiss('address-street-input', 'Test');

    // Scroll to building input
    await waitFor(element(by.id('address-building-input')))
        .toExist()
        .whileElement(by.id('create-request-address-scroll-view'))
        .scroll(150, 'down');

    await typeTextAndDismiss('address-building-input', '1');
    await typeTextAndDismiss('address-door-input', '1');

    // Scroll to submit
    await waitFor(element(by.id('create-request-submit-button')))
        .toBeVisible()
        .whileElement(by.id('create-request-address-scroll-view'))
        .scroll(200, 'down');

    await new Promise(resolve => setTimeout(resolve, 500));
    await element(by.id('create-request-submit-button')).tap();

    // Handle success alert
    await waitFor(element(by.text('OK')))
        .toBeVisible()
        .withTimeout(15000);
    await element(by.text('OK')).tap();

    // Wait for redirect to requests list
    await waitFor(element(by.id('requests-list')))
        .toBeVisible()
        .withTimeout(15000);
};

/**
 * Helper to login a user from landing page
 * @param {Object} user - User with email and password
 */
const loginUser = async (user) => {
    await waitFor(element(by.id('landing-login-button')))
        .toBeVisible()
        .withTimeout(10000);
    await element(by.id('landing-login-button')).tap();

    await element(by.id('signin-email-input')).typeText(user.email);
    await typePassword('signin-password-input', 'signin-password-toggle', user.password);
    await dismissKeyboard();
    await element(by.id('signin-button')).tap();

    await waitFor(element(by.id('feed-search-bar')))
        .toBeVisible()
        .withTimeout(10000);

    // Dismiss any alerts
    try { await element(by.text('OK')).tap(); } catch (e) { }
    try { await element(by.text('Tamam')).tap(); } catch (e) { }

    await new Promise(resolve => setTimeout(resolve, 500));
};

describe('Volunteer for Request Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    describe('Full Volunteer Flow', () => {
        it('should complete volunteer, check status, and withdraw cycle', async () => {
            // This test creates two users and tests the full volunteer cycle

            // --- STEP 1: Create User1 and a request ---
            await device.reloadReactNative();

            const user1 = generateTestUser();
            await registerUser(user1);

            // Login as user1
            await element(by.id('signin-email-input')).typeText(user1.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user1.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            try { await element(by.text('OK')).tap(); } catch (e) { }

            // Create a request
            const testRequestTitle = `Volunteer Flow ${Date.now()}`;
            await createTestRequest(testRequestTitle);

            // Logout user1
            await logout();

            // Reload app to ensure clean landing page state
            await device.reloadReactNative();

            // Wait for landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(15000);

            // --- STEP 2: Create User2 and volunteer for the request ---
            const user2 = generateTestUser();
            await registerUser(user2);

            // Login as user2
            await element(by.id('signin-email-input')).typeText(user2.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user2.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            try { await element(by.text('OK')).tap(); } catch (e) { }

            // Navigate to requests and find the request created by user1
            await navigateToRequests();

            const cardLabel = `View request ${testRequestTitle}`;
            await waitFor(element(by.label(cardLabel)))
                .toBeVisible()
                .whileElement(by.id('requests-list'))
                .scroll(300, 'down');

            await element(by.label(cardLabel)).tap();

            // --- STEP 3: Verify volunteer button is visible (not edit button) ---
            await waitFor(element(by.id('volunteer-button')))
                .toBeVisible()
                .withTimeout(10000);

            // --- STEP 4: Tap volunteer button ---
            await element(by.id('volunteer-button')).tap();
            await dismissAlert();

            // --- STEP 5: Verify withdraw button appears (volunteered status) ---
            await waitFor(element(by.id('volunteer-withdraw-button')))
                .toBeVisible()
                .withTimeout(10000);

            // --- STEP 6: Withdraw from request ---
            await element(by.id('volunteer-withdraw-button')).tap();
            await dismissAlert();

            // --- STEP 7: Verify volunteer button reappears ---
            await waitFor(element(by.id('volunteer-button')))
                .toBeVisible()
                .withTimeout(10000);
        }, 300000); // 5 minute timeout for this comprehensive test
    });

    describe('Request Owner View', () => {
        it('should show edit/delete buttons for own request', async () => {
            await device.reloadReactNative();

            // Check if logged in and logout
            try {
                await expect(element(by.id('feed-search-bar'))).toBeVisible();
                await logout();
            } catch (e) { }

            // Register and login fresh user
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            try { await element(by.text('OK')).tap(); } catch (e) { }

            // Create a request
            const requestTitle = `Owner Test ${Date.now()}`;
            await createTestRequest(requestTitle);

            // Find and tap our request
            const cardLabel = `View request ${requestTitle}`;
            await waitFor(element(by.label(cardLabel)))
                .toBeVisible()
                .whileElement(by.id('requests-list'))
                .scroll(300, 'down');

            await element(by.label(cardLabel)).tap();

            // Wait for request details to load
            await waitFor(element(by.id('screen-title')))
                .toBeVisible()
                .withTimeout(10000);

            // Scroll to find edit button (owner view buttons are at the bottom)
            await waitFor(element(by.id('request-details-edit-button')))
                .toBeVisible()
                .whileElement(by.id('request-details-scroll-view'))
                .scroll(300, 'down');
        }, 180000);

        it('should not show volunteer button for own request', async () => {
            await device.reloadReactNative();

            // Check if logged in and logout
            try {
                await expect(element(by.id('feed-search-bar'))).toBeVisible();
                await logout();
            } catch (e) { }

            // Register and login fresh user
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            try { await element(by.text('OK')).tap(); } catch (e) { }

            // Create a request
            const requestTitle = `No Volunteer ${Date.now()}`;
            await createTestRequest(requestTitle);

            // Find and tap our request
            const cardLabel = `View request ${requestTitle}`;
            await waitFor(element(by.label(cardLabel)))
                .toBeVisible()
                .whileElement(by.id('requests-list'))
                .scroll(300, 'down');

            await element(by.label(cardLabel)).tap();

            // Volunteer button should NOT be visible (owner view)
            await expect(element(by.id('volunteer-button'))).not.toBeVisible();
        }, 180000);
    });
});
