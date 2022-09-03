import type {TestRunnerPlugin} from '@web/test-runner-core';
import {PlaywrightLauncher} from '@web/test-runner-playwright';
import {join} from 'path';
import {compareScreenshot} from './playwright/compare-screenshot';
import {sanitizeScreenshotFilePath} from './screenshot-file-path';
import {compareScreenshotCommandName} from './shared/command-name';
import {CompareScreenshotCommandPayload} from './shared/compare-screenshot-payload';
import {verifyCompareScreenshotPayload} from './shared/verify-compare-screenshot-payload';
export * from './shared';

export function screenshotPlugin(
    baseScreenshotDirRaw: string | string[] = '.',
): TestRunnerPlugin<CompareScreenshotCommandPayload> {
    const baseScreenshotDir = Array.isArray(baseScreenshotDirRaw)
        ? join(...baseScreenshotDirRaw)
        : baseScreenshotDirRaw;

    return {
        name: 'compare-screenshot-command',
        async executeCommand({command, payload, session}) {
            if (command === compareScreenshotCommandName) {
                verifyCompareScreenshotPayload(payload);
                const browser = session.browser;

                const screenshotFilePath = await sanitizeScreenshotFilePath({
                    givenPath: payload.path,
                    baseScreenshotDir,
                    browser,
                });

                // handle specific behavior for playwright
                if (
                    browser.type.toLowerCase() === 'playwright' &&
                    browser instanceof PlaywrightLauncher
                ) {
                    const page = browser.getPage(session.id);

                    return await compareScreenshot({
                        ...payload,
                        path: screenshotFilePath,
                        location: payload.selector ? page.locator(payload.selector) : page,
                    });
                }

                throw new Error(
                    `Browser "${browser.type}" is not yet supported for screenshot comparison. Either use Playwright or open an issue here: https://github.com/electrovir/web-test-runner-screenshot/issues/new`,
                );
            }
            // mark this command as unhandled by returning undefined
            return undefined;
        },
    };
}
