import {assert} from '@open-wc/testing';
import {executeServerCommand} from '@web/test-runner-commands';
import {extractErrorMessage} from 'augment-vir';
import {compareScreenshotCommandName} from './shared/command-name';
import {CompareScreenshotCommandPayload} from './shared/compare-screenshot-payload';
import {ComparisonResult} from './shared/comparison-result';
export type {CompareScreenshotCommandPayload} from './shared/compare-screenshot-payload';
export type {ComparisonResult} from './shared/comparison-result';

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

    try {
        const screenshotResult = await compareScreenshot(payload);
        passed = screenshotResult.passed;
        message = screenshotResult.message;
    } catch (error) {
        message = extractErrorMessage(error);
        passed = false;
    }

    const preMessage = payload.failureMessage ? `${payload.failureMessage}: ` : '';
    const finalMessage = `${preMessage}${message}`;

    assert.isTrue(passed, finalMessage);
}
