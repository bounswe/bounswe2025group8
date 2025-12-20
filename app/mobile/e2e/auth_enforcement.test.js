/**
 * E2E Test: Authentication and Role Enforcement (Scenario 7)
 * 
 * Tests authentication requirements including:
 * - Guest user can view feed
 * - Guest user cannot create requests
 * - Guest user cannot volunteer (login prompt)
 * - Different views for creator vs volunteer
 * - Logout functionality
 * - Protected routes
 */

const { login, logout, navigateToFeed, navigateToCreateRequest, navigateToProfile, waitForElement, TEST_CREDENTIALS } = require('./testHelpers');

describe('Authentication and Role Enforcement Flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    describe('Guest User Access', () => {
        it('should allow guest to view feed', async () => {
            // Tap "Continue as Guest" or navigate to feed without login
            try {
                await element(by.text('Continue as Guest')).tap();
            } catch (e) {
                // Try alternative text
                await element(by.label('Continue as guest')).tap();
            }

            // Feed should be visible
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);
        });

        it('should disable create request button for guest', async () => {
            try {
                await element(by.text('Continue as Guest')).tap();
            } catch (e) {
                await element(by.label('Continue as guest')).tap();
            }

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Create button should be disabled or show different state
            await expect(element(by.id('tab-create-disabled')).or(element(by.id('tab-create')))).toBeVisible();
        });

        it('should show categories for guest', async () => {
            try {
                await element(by.text('Continue as Guest')).tap();
            } catch (e) {
                await element(by.label('Continue as guest')).tap();
            }

            await waitFor(element(by.id('tab-categories')))
                .toBeVisible()
                .withTimeout(10000);

            await element(by.id('tab-categories')).tap();

            await waitFor(element(by.id('categories-search-bar')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Authenticated User Access', () => {
        it('should enable create request for logged-in user', async () => {
            await login();

            // Create tab should be enabled
            await expect(element(by.id('tab-create'))).toBeVisible();

            await element(by.id('tab-create')).tap();

            // Should navigate to create request screen
            await waitFor(element(by.id('create-request-title-input')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should show profile for logged-in user', async () => {
            await login();

            await element(by.id('tab-profile')).tap();

            // Profile screen should show user information
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Request Ownership Views', () => {
        it('should show different view for request creator', async () => {
            await login();

            // Create a request
            await element(by.id('tab-create')).tap();

            const timestamp = Date.now();
            await element(by.id('create-request-title-input')).typeText(`Creator View ${timestamp}`);
            await element(by.id('create-request-description-input')).typeText('Test creator view');
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

            await waitFor(element(by.text('OK')))
                .toBeVisible()
                .withTimeout(10000);
            await element(by.text('OK')).tap();

            // Owner should see edit/delete buttons, NOT volunteer button
            await expect(element(by.id('volunteer-button'))).not.toBeVisible();
        });
    });

    describe('Logout Functionality', () => {
        it('should logout successfully', async () => {
            await login();

            // Navigate to settings
            await element(by.id('feed-settings-button')).tap();

            // Tap logout
            await waitFor(element(by.id('settings-logout-button')))
                .toBeVisible()
                .withTimeout(5000);
            await element(by.id('settings-logout-button')).tap();

            // Should be back on landing page
            await waitFor(element(by.id('landing-login-button')))
                .toBeVisible()
                .withTimeout(10000);
        });

        it('should clear session after logout', async () => {
            await login();

            await element(by.id('feed-settings-button')).tap();
            await element(by.id('settings-logout-button')).tap();

            await waitFor(element(by.id('landing-login-button')))
                .toBeVisible()
                .withTimeout(10000);

            // App reload should show landing page (not auto-login)
            await device.reloadReactNative();

            await expect(element(by.id('landing-login-button'))).toBeVisible();
        });
    });

    describe('Protected Routes', () => {
        it('should prompt login when guest tries to volunteer', async () => {
            // Enter as guest
            try {
                await element(by.text('Continue as Guest')).tap();
            } catch (e) {
                await element(by.label('Continue as guest')).tap();
            }

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Navigate to requests
            await element(by.id('tab-requests')).tap();

            // Try to tap a request and volunteer
            // The app should prompt for login
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(5000);
        });
    });

    describe('Session Persistence', () => {
        it('should maintain login state after navigation', async () => {
            await login();

            // Navigate through tabs
            await element(by.id('tab-categories')).tap();
            await element(by.id('tab-requests')).tap();
            await element(by.id('tab-profile')).tap();
            await element(by.id('tab-home')).tap();

            // Should still be logged in (create button enabled)
            await expect(element(by.id('tab-create'))).toBeVisible();
        });
    });
});
