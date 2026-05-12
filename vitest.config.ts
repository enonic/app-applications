/// <reference types="vitest/config" />
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/main/resources/assets/js/v2/**/*.test.{ts,tsx}'],
        environment: 'node',
        passWithNoTests: true,
        reporters: ['dot'],
    },
    resolve: {
        alias: {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime',
            'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',
        },
    },
});
