import type {TestRunnerPlugin} from '@web/test-runner-core';
import {PlaywrightLauncher} from '@web/test-runner-playwright';
import {compareScreenshot, CompareScreenshotInputsInPayload} from './playwright/compare-screenshot';

type ScreenshotPluginPayload = {
    selector: string;
} & CompareScreenshotInputsInPayload;

const compareScreenshotCommandName = 'compare-screenshot';

export const screenshotPlugin: TestRunnerPlugin<ScreenshotPluginPayload> = {
    name: 'compare-screenshot-command',
    async executeCommand({command, payload, session}) {
        if (command === compareScreenshotCommandName) {
            if (!payload) {
                throw new Error(
                    `Missing correct input to ${compareScreenshotCommandName}. See docs.`,
                );
            }
            const browser = session.browser;

            // handle specific behavior for playwright
            if (browser.type === 'playwright' && browser instanceof PlaywrightLauncher) {
                const page = browser.getPage(session.id);

                const compareResult = await compareScreenshot({
                    ...payload,
                    browserName: browser.name.toLowerCase(),
                    location: payload?.selector ? page.locator(payload.selector) : page,
                });
                return compareResult;
            }

            // you might not be able to support all browser launchers
            throw new Error(
                `Taking screenshots is not supported for browser type ${browser.type}.`,
            );
        }
        return undefined;
    },
};
