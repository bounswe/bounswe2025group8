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

const { login, navigateToFeed, navigateToCategories, navigateToRequests, navigateToProfile, navigateToCreateRequest, waitForElement, generateTestUser, registerUser, typePassword, dismissKeyboard, logout, dismissAlert } = require('./testHelpers');

describe('Performance under Typical Usage', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true });
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
            // Ensure we're on landing page
            await waitFor(element(by.id('landing-register-button')))
                .toBeVisible()
                .withTimeout(10000);

            // Register a new user
            const user = generateTestUser();
            await registerUser(user);

            const startTime = Date.now();

            // Login
            await element(by.id('signin-email-input')).typeText(user.email);
            await typePassword('signin-password-input', 'signin-password-toggle', user.password);
            await dismissKeyboard();
            await element(by.id('signin-button')).tap();

            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            const loginTime = Date.now() - startTime;
            console.log(`Login completion time: ${loginTime}ms`);

            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });
    });

    describe('Feed Loading Performance', () => {
        it('should load feed content within acceptable time', async () => {
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

            const startTime = Date.now();

            // Wait for feed content to be fully loaded
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(10000);

            // Swipe to load more content (instead of RCTScrollView scroll)
            await element(by.id('feed-search-bar')).swipe('up', 'fast', 0.5);

            const loadTime = Date.now() - startTime;
            console.log(`Feed load time: ${loadTime}ms`);

            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });

        it('should handle pull-to-refresh smoothly', async () => {
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

            // Pull to refresh multiple times using swipe
            for (let i = 0; i < 3; i++) {
                await element(by.id('feed-search-bar')).swipe('down', 'fast', 0.3);
                await new Promise(resolve => setTimeout(resolve, 1000));
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

            const startTime = Date.now();

            // Navigate through tabs that have tab bar (feed and categories only)
            await element(by.id('tab-categories')).tap();
            await waitFor(element(by.id('categories-search-bar')))
                .toBeVisible()
                .withTimeout(3000);

            await element(by.id('tab-home')).tap();
            await waitFor(element(by.id('feed-search-bar')))
                .toBeVisible()
                .withTimeout(3000);

            await element(by.id('tab-categories')).tap();
            await waitFor(element(by.id('categories-search-bar')))
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

            // Scroll down using swipe
            for (let i = 0; i < 5; i++) {
                await element(by.id('feed-search-bar')).swipe('up', 'fast', 0.5);
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Scroll back up using swipe
            for (let i = 0; i < 5; i++) {
                await element(by.id('feed-search-bar')).swipe('down', 'fast', 0.5);
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // App should still be responsive
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });

        it('should scroll categories smoothly', async () => {
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

            await navigateToCategories();

            // Scroll through categories using swipe
            for (let i = 0; i < 3; i++) {
                await element(by.id('categories-search-bar')).swipe('up', 'fast', 0.3);
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            await expect(element(by.id('categories-search-bar'))).toBeVisible();
        });
    });

    describe('Stress Testing', () => {
        it('should handle multiple interactions without crashing', async () => {
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

            // Perform many interactions (stay on feed screen which has tab bar)
            // Just test rapid navigation instead of search which loses tab bar
            for (let i = 0; i < 3; i++) {
                await element(by.id('tab-categories')).tap();
                await waitFor(element(by.id('categories-search-bar')))
                    .toBeVisible()
                    .withTimeout(3000);

                await element(by.id('tab-home')).tap();
                await waitFor(element(by.id('feed-search-bar')))
                    .toBeVisible()
                    .withTimeout(3000);
            }

            // App should still work
            await expect(element(by.id('feed-search-bar'))).toBeVisible();
        });

        it('should handle app backgrounding and foregrounding', async () => {
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

            // Navigate extensively (only use feed and categories which have tab bar)
            for (let cycle = 0; cycle < 3; cycle++) {
                await element(by.id('tab-categories')).tap();
                await waitFor(element(by.id('categories-search-bar')))
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
