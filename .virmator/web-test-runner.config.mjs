import {screenshotPlugin} from '../plugin/plugin.js';
import baseConfig from './web-test-runner-base.mjs';

/** @type {import('@web/test-runner').TestRunnerConfig} */
const webTestRunnerConfig = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        screenshotPlugin('test-screenshots'),
    ],
};

export default webTestRunnerConfig;
