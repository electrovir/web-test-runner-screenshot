import {assert} from '@open-wc/testing';
import {executeServerCommand} from '@web/test-runner-commands';
import {extractErrorMessage} from 'augment-vir';
import {compareScreenshotCommandName} from './shared/command-name';
import {CompareScreenshotCommandPayload} from './shared/compare-screenshot-payload';
import {ComparisonResult} from './shared/comparison-result';
export * from './shared';

export async function compareScreenshot(
    payload: CompareScreenshotCommandPayload,
): Promise<ComparisonResult> {
    return await executeServerCommand(compareScreenshotCommandName, payload);
}

export async function assertScreenshot(
    payload: CompareScreenshotCommandPayload & {
        failureMessage?: string;
    },
): Promise<void> {
    let passed: undefined | boolean;
    let message: undefined | string;
    let path: undefined | string;

    try {
        const screenshotResult = await compareScreenshot(payload);
        passed = screenshotResult.passed;
        message = screenshotResult.message;
        path = screenshotResult.file;
    } catch (error) {
        message = extractErrorMessage(error);
        passed = false;
    }

    const preMessage = payload.failureMessage ? `${payload.failureMessage}: ` : '';
    const finalMessage = `${preMessage}${message} for path "${path}"`;

    assert.isTrue(passed, finalMessage);
}
