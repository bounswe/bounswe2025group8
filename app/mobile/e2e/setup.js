/**
 * Detox Jest Setup
 * Runs before all tests to configure the test environment
 */

beforeAll(async () => {
    // Launch app fresh at start
    await device.launchApp({
        newInstance: true,
    });
});

// No pressBack on iOS - its Android only
// Keyboard will be handled in individual tests
