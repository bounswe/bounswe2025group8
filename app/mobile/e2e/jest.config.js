/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
    rootDir: '..',
    testMatch: ['<rootDir>/e2e/**/*.test.js'],
    testTimeout: 120000,
    maxWorkers: 1,
    globalSetup: 'detox/runners/jest/globalSetup',
    globalTeardown: 'detox/runners/jest/globalTeardown',
    reporters: ['detox/runners/jest/reporter', 'jest-junit'],
    testEnvironment: 'detox/runners/jest/testEnvironment',
    setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
    verbose: true,
};
