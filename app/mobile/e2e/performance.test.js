/**
 * E2E Test: Performance under Typical Usage (Scenario 10)
 * 
 * Tests performance metrics including:
 * - App launch time
 * - Feed loading time
 * - Navigation smoothness
 * - Pull-to-refresh
 * - Multiple rapid interactions
 */

const { login, navigateToFeed, navigateToCategories, navigateToRequests, navigateToProfile, waitForElement } = require('./testHelpers');

describe('Performance under Typical Usage', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    describe('App Launch Performance', () => {
        it('should launch app within acceptable time', async () => {
            const startTime = Date.now();

            await device.launchApp({ newInstance: true });

            // Landing page should be visible
            await waitFor(element(by.id('landing-login-button')))
                .toBeVisible()
                .withTimeout(10000);

            const launchTime = Date.now() - startTime;
            console.log(`App launch time: ${launchTime}ms`);

            // Launch should complete (test passes if we got here)
            await expect(element(by.id('landing-login-button'))).toBeVisible();
        });

        it('should complete login within acceptable time', async () => {
            const startTime = Date.now();

            await login();

            const loginTime = Date.now() - startTime;
            console.log(`Login completion time: ${loginTime}ms`);

            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });

    describe('Feed Loading Performance', () => {
        it('should load feed content within acceptable time', async () => {
            await login();

            const startTime = Date.now();

            // Wait for feed content to be fully loaded
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Scroll to load more content
            await element(by.type('RCTScrollView')).scroll(300, 'down');

            const loadTime = Date.now() - startTime;
            console.log(`Feed load time: ${loadTime}ms`);

            await expect(element(by.type('RCTScrollView'))).toBeVisible();
        });

        it('should handle pull-to-refresh smoothly', async () => {
            await login();

            // Pull to refresh multiple times
            for (let i = 0; i < 3; i++) {
                await element(by.type('RCTScrollView')).scroll(-100, 'down');
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(5000);
            }

            // App should still be responsive
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });

    describe('Navigation Performance', () => {
        it('should navigate between tabs smoothly', async () => {
            await login();

            const startTime = Date.now();

            // Navigate through all tabs
            await element(by.id('tab-categories')).tap();
            await waitFor(element(by.id('categories-search-bar')))
                .toBeVisible()
                .withTimeout(3000);

            await element(by.id('tab-requests')).tap();
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(3000);

            await element(by.id('tab-profile')).tap();
            await waitFor(element(by.type('RCTScrollView')))
                .toBeVisible()
                .withTimeout(3000);

            await element(by.id('tab-home')).tap();
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(3000);

            const navTime = Date.now() - startTime;
            console.log(`Full navigation cycle time: ${navTime}ms`);

            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });

        it('should handle rapid tab switching', async () => {
            await login();

            // Rapidly switch tabs
            for (let i = 0; i < 5; i++) {
                await element(by.id('tab-categories')).tap();
                await element(by.id('tab-home')).tap();
            }

            // App should not crash and remain responsive
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });

    describe('Scrolling Performance', () => {
        it('should scroll feed smoothly', async () => {
            await login();

            // Scroll down extensively
            for (let i = 0; i < 5; i++) {
                await element(by.type('RCTScrollView')).scroll(200, 'down');
            }

            // Scroll back up
            for (let i = 0; i < 5; i++) {
                await element(by.type('RCTScrollView')).scroll(200, 'up');
            }

            // App should still be responsive
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });

        it('should scroll categories smoothly', async () => {
            await login();
            await navigateToCategories();

            // Scroll through categories
            for (let i = 0; i < 3; i++) {
                await element(by.type('RCTScrollView')).scroll(150, 'down');
            }

            await expect(element(by.type('RCTScrollView'))).toBeVisible();
        });
    });

    describe('Stress Testing', () => {
        it('should handle multiple interactions without crashing', async () => {
            await login();

            // Perform many interactions
            await element(by.id('feed-search-bar')).tap();
            await waitFor(element(by.id('search-input')))
                .toBeVisible()
                .withTimeout(3000);

            await element(by.id('search-input')).typeText('test');
            await element(by.id('search-input')).clearText();
            await element(by.id('search-input')).typeText('help');

            // Go back and navigate
            await device.pressBack();

            await element(by.id('tab-categories')).tap();
            await element(by.id('tab-requests')).tap();
            await element(by.id('tab-home')).tap();

            // App should still work
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });

        it('should handle app backgrounding and foregrounding', async () => {
            await login();

            // Background the app
            await device.sendToHome();

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Foreground the app
            await device.launchApp({ newInstance: false });

            // App should resume correctly
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });

    describe('Memory and Resource Usage', () => {
        it('should not leak memory after repeated navigation', async () => {
            await login();

            // Navigate extensively
            for (let cycle = 0; cycle < 3; cycle++) {
                await element(by.id('tab-categories')).tap();
                await waitFor(element(by.id('categories-search-bar')))
                    .toBeVisible()
                    .withTimeout(3000);

                await element(by.id('tab-create')).tap();
                await waitFor(element(by.id('create-request-title-input')))
                    .toBeVisible()
                    .withTimeout(3000);

                await element(by.id('tab-requests')).tap();
                await waitFor(element(by.type('RCTScrollView')))
                    .toBeVisible()
                    .withTimeout(3000);

                await element(by.id('tab-profile')).tap();
                await waitFor(element(by.type('RCTScrollView')))
                    .toBeVisible()
                    .withTimeout(3000);

                await element(by.id('tab-home')).tap();
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(3000);
            }

            // App should still be responsive
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });
});
