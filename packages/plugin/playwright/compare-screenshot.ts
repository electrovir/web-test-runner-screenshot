import {Overwrite} from 'augment-vir';
import {existsSync} from 'fs';
import {readFile, writeFile} from 'fs/promises';
import {Locator, Page} from 'playwright-core';
import {
    CompareInputsSharedWithPayload,
    ImageComparatorOptions,
    UpdateScreenshotFileStrategyEnum,
} from '../shared/compare-screenshot-payload';
import {ComparisonResult} from '../shared/comparison-result';
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
        path: comparisonFilePath,
    };

    if (!existsSync(comparisonFilePath)) {
        let extraMessage = writeMissingFile
            ? ' Saved new screenshot to file. Run again to compare.'
            : '';
        if (writeMissingFile) {
            await writeFile(comparisonFilePath, receivedScreenshot);
        }

        return {
            ...initialResult,
            passed: false,
            message: `Comparison screenshot file "${comparisonFilePath}" is missing.${extraMessage}`,
        };
    }

    const expected = await readFile(comparisonFilePath);

    const comparator = getComparator('image/png');

    const result = comparator(receivedScreenshot, expected, comparisonOptions);

    if (result) {
        const extraMessage = overwriteChangedImage
            ? ' Overwrote comparison file with new screenshot.'
            : '';
        if (overwriteChangedImage) {
            await writeFile(comparisonFilePath, receivedScreenshot);
        }
        return {
            ...initialResult,
            message: `Screenshot differed from comparison image file.${extraMessage}`,
            passed: false,
        };
    } else {
        return {
            ...initialResult,
            message: 'Screenshot matched comparison image file.',
            passed: true,
        };
    }
}
