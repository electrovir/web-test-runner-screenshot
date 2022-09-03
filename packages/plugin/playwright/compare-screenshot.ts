import {Overwrite} from 'augment-vir';
import {existsSync} from 'fs';
import {readFile, writeFile} from 'fs/promises';
import {dirname} from 'path';
import {Locator, Page} from 'playwright-core';
import {
    CompareInputsSharedWithPayload,
    ImageComparatorOptions,
    UpdateScreenshotFileStrategyEnum,
} from '../shared/compare-screenshot-payload';
import {ComparisonResult} from '../shared/comparison-result';
import {comparisonMessages} from '../shared/messages';
import {getComparator} from './comparators';

export type CompareScreenshotInputs = {
    location: Locator | Page;
} & Overwrite<CompareInputsSharedWithPayload, {path: string}>;

export async function compareScreenshot(inputs: CompareScreenshotInputs) {
    const receivedScreenshot = await inputs.location.screenshot({
        ...inputs,
        type: 'png',
        path: '',
    });
    return await compareScreenshotToFile({
        receivedScreenshot,
        comparisonFilePath: inputs.path,
        comparisonOptions: inputs,
        screenshotUpdateStrategy:
            inputs.updateScreenshotFileStrategy ?? UpdateScreenshotFileStrategyEnum.All,
    });
}

async function compareScreenshotToFile({
    receivedScreenshot,
    comparisonFilePath,
    comparisonOptions,
    screenshotUpdateStrategy,
}: {
    receivedScreenshot: Buffer;
    comparisonFilePath: string;
    comparisonOptions: ImageComparatorOptions;
    screenshotUpdateStrategy: UpdateScreenshotFileStrategyEnum;
}): Promise<ComparisonResult> {
    const writeMissingFile = screenshotUpdateStrategy !== UpdateScreenshotFileStrategyEnum.None;
    const overwriteChangedImage = screenshotUpdateStrategy === UpdateScreenshotFileStrategyEnum.All;

    const initialResult: Omit<ComparisonResult, 'passed' | 'message'> = {
        file: comparisonFilePath,
        dir: dirname(comparisonFilePath),
    };

    if (!existsSync(comparisonFilePath)) {
        if (writeMissingFile) {
            await writeFile(comparisonFilePath, receivedScreenshot);
        }

        return {
            ...initialResult,
            passed: false,
            message: comparisonMessages.missing(writeMissingFile),
        };
    }

    const expected = await readFile(comparisonFilePath);

    const comparator = getComparator('image/png');

    const result = comparator(receivedScreenshot, expected, comparisonOptions);

    if (result) {
        if (overwriteChangedImage) {
            await writeFile(comparisonFilePath, receivedScreenshot);
        }
        return {
            ...initialResult,
            message: comparisonMessages.different(overwriteChangedImage),
            passed: false,
        };
    } else {
        return {
            ...initialResult,
            message: comparisonMessages.matched,
            passed: true,
        };
    }
}
