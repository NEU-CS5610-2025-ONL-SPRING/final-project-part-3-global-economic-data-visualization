module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/tests/**/*.Test.tsx'],
    moduleDirectories: ['node_modules', 'src'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.jest.json'
            }
        ]
    },
    setupFiles: ['<rootDir>/src/tests/setup.js'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
}