import '@testing-library/jest-dom';

const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            /Warning: ReactDOM.render is no longer supported in React 18./.test(args[0]) ||
            /Warning: An update to .* inside a test was not wrapped in act/.test(args[0])
        ) {
            return;
        }
        originalError(...args);
    };
});

afterAll(() => {
    console.error = originalError;
});