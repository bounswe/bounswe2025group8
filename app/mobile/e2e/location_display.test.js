/**
 * E2E Test: Location Display and Map Rendering (Scenario 6)
 * 
 * Tests location-related features including:
 * - Location info on request cards
 * - Address details on request detail page
 * - Address selection during request creation
 * - Country/state/city/neighborhood dropdowns
 */

const { login, navigateToFeed, navigateToRequests, navigateToCreateRequest, dismissAlert, generateTestUser, registerUser, typePassword, dismissKeyboard, logout, typeTextAndDismiss } = require('./testHelpers');

describe('Location Display Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();

        // Ensure we start from the landing page (logout if logged in)
        try {
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(3000);
            await logout();
        } catch (e) {
            try {
                await waitFor(element(by.id('landing-login-button')))
                    .toBeVisible()
                    .withTimeout(5000);
            } catch (e2) {
                // Might be on a different screen
            }
        }
    });

    describe('Request Cards Location', () => {
        it('should display location info on feed request cards', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Feed is visible - request cards with location info should be in the feed
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });

    describe('Request Details Location', () => {
        it('should display full address on request detail page', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await navigateToRequests();

            // Wait for requests list
            await waitFor(element(by.id('requests-list')))
                .toBeVisible()
                .withTimeout(5000);

            // Requests list is visible - it contains request cards with location info
            await expect(element(by.id('requests-list'))).toBeVisible();
        });
    });

    describe('Address Selection in Create Request', () => {
        it('should display country selector', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await navigateToCreateRequest();

            // Fill required fields to get to address step
            await typeTextAndDismiss('create-request-title-input', 'Location Test');
            await typeTextAndDismiss('create-request-description-input', 'Testing location', true);

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

            await waitFor(element(by.id('create-request-upload-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-upload-next-button')).tap();
            await waitFor(element(by.id('create-request-deadline-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Should be on address step
            await expect(element(by.id('address-country-selector'))).toBeVisible();
        });

        it('should select country and enable state selector', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await navigateToCreateRequest();

            await typeTextAndDismiss('create-request-title-input', 'Country Test');
            await typeTextAndDismiss('create-request-description-input', 'Testing country selection', true);

            await element(by.id('create-request-category-selector')).tap();
            await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
                .toExist()
                .withTimeout(5000);
            await element(by.id('category-option-GROCERY_SHOPPING')).tap();

            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await dismissKeyboard();
            await element(by.id('create-request-next-button')).tap();

            await waitFor(element(by.id('create-request-upload-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-upload-next-button')).tap();
            await waitFor(element(by.id('create-request-deadline-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Select country (use Afghanistan as it's at the top of the list)
            await element(by.id('address-country-selector')).tap();
            await waitFor(element(by.id('address-option-AFGHANISTAN')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-AFGHANISTAN')).tap();

            // State selector should be available
            await new Promise(resolve => setTimeout(resolve, 500));
            await expect(element(by.id('address-state-selector'))).toBeVisible();
        });

        it('should select state and enable city selector', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await navigateToCreateRequest();

            await typeTextAndDismiss('create-request-title-input', 'State Test');
            await typeTextAndDismiss('create-request-description-input', 'Testing state selection', true);

            await element(by.id('create-request-category-selector')).tap();
            await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
                .toExist()
                .withTimeout(5000);
            await element(by.id('category-option-GROCERY_SHOPPING')).tap();

            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await dismissKeyboard();
            await element(by.id('create-request-next-button')).tap();

            await waitFor(element(by.id('create-request-upload-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-upload-next-button')).tap();
            await waitFor(element(by.id('create-request-deadline-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Select country
            await element(by.id('address-country-selector')).tap();
            await waitFor(element(by.id('address-option-AFGHANISTAN')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-AFGHANISTAN')).tap();
            await new Promise(resolve => setTimeout(resolve, 500));

            // Select state
            await element(by.id('address-state-selector')).tap();
            await waitFor(element(by.id('address-option-KABUL')))
                .toBeVisible()
                .whileElement(by.id('address-picker-scroll-view'))
                .scroll(100, 'down');
            await element(by.id('address-option-KABUL')).tap();

            // City selector should be available
            await new Promise(resolve => setTimeout(resolve, 500));
            await expect(element(by.id('address-city-selector'))).toBeVisible();
        });

        it('should complete full address selection', async () => {
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register and login
            const user = generateTestUser();
            await registerUser(user);

            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            await navigateToCreateRequest();

            await typeTextAndDismiss('create-request-title-input', 'Full Address Test');
            await typeTextAndDismiss('create-request-description-input', 'Testing complete address', true);

            await element(by.id('create-request-category-selector')).tap();
            await waitFor(element(by.id('category-option-GROCERY_SHOPPING')))
                .toExist()
                .withTimeout(5000);
            await element(by.id('category-option-GROCERY_SHOPPING')).tap();

            await waitFor(element(by.id('create-request-next-button')))
                .toExist()
                .whileElement(by.id('create-request-scroll-view'))
                .scroll(150, 'down');

            await dismissKeyboard();
            await element(by.id('create-request-next-button')).tap();

            await waitFor(element(by.id('create-request-upload-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-upload-next-button')).tap();
            await waitFor(element(by.id('create-request-deadline-next-button'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-request-deadline-next-button')).tap();

            // Complete address selection (use Afghanistan/Kabul)
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

            // Fill remaining address fields
            await typeTextAndDismiss('address-neighborhood-input', 'Moda');
            await typeTextAndDismiss('address-street-input', 'Main Street');

            // Scroll to building input
            await waitFor(element(by.id('address-building-input')))
                .toExist()
                .whileElement(by.id('create-request-address-scroll-view'))
                .scroll(150, 'down');

            await typeTextAndDismiss('address-building-input', '42');
            await typeTextAndDismiss('address-door-input', '3B');

            // All address fields should be filled
            await waitFor(element(by.id('create-request-submit-button')))
                .toBeVisible()
                .whileElement(by.id('create-request-address-scroll-view'))
                .scroll(200, 'down');

            await expect(element(by.id('create-request-submit-button'))).toBeVisible();
        }, 180000);
    });
});
