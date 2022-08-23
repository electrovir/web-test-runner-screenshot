import {existsSync} from 'fs';
import {readFile, writeFile} from 'fs/promises';
import mime from 'mime';
import {join} from 'path';
import {Locator, Page, PageScreenshotOptions} from 'playwright-core';
import {getComparator, ImageComparatorOptions} from './comparators';

export enum UpdateScreenshotEnum {
    /** Overwrite all screenshot files. This is the default behavior. */
    All = 'all',
    /** Don't write any screenshot files, even ones that are missing. */
    None = 'none',
    /** Only write screenshot files that are missing. */
    Missing = 'missing',
}

export type CompareScreenshotInputsInPayload = {
    screenshotFilePath: string | string;
    screenshotOptions?: PageScreenshotOptions | undefined;
    comparisonOptions?: ImageComparatorOptions | undefined;
    updateScreenshots?: UpdateScreenshotEnum;
};

export type CompareScreenshotInputs = {
    location: Locator | Page;
    browserName: string;
} & CompareScreenshotInputsInPayload;

export type ComparisonResult = {
    passed: boolean;
    message: string;
    filePath: string;
    newScreenshot: Buffer;
};

export async function compareScreenshot(inputs: CompareScreenshotInputs) {
    const newScreenshot = await inputs.location.screenshot(inputs.screenshotOptions);
    const comparisonResult = await compareScreenshotToFile({
        receivedScreenshot: newScreenshot,
        comparisonFilePath: inputs.screenshotFilePath,
        comparisonOptions: inputs.comparisonOptions ?? {},
        screenshotUpdateStrategy: inputs.updateScreenshots ?? UpdateScreenshotEnum.All,
        browserName: inputs.browserName,
    });

    return comparisonResult;
}

async function compareScreenshotToFile({
    receivedScreenshot,
    comparisonFilePath,
    comparisonOptions,
    browserName,
}: {
    receivedScreenshot: Buffer;
    browserName: string;
    comparisonFilePath: string | string[];
    comparisonOptions: ImageComparatorOptions;
    screenshotUpdateStrategy: UpdateScreenshotEnum;
}): Promise<ComparisonResult> {
    if (Array.isArray(comparisonFilePath)) {
        comparisonFilePath = join(process.cwd(), ...comparisonFilePath);
    }
    if (!comparisonFilePath.match(/\.\w+$/)) {
        return {
            filePath: comparisonFilePath,
            newScreenshot: receivedScreenshot,
            message: `Missing extension from file path: "${comparisonFilePath}"`,
            passed: false,
        };
    }
    comparisonFilePath = comparisonFilePath.replace(/\.(\w+)$/, `.${browserName}.$1`);
    const initialResult: Omit<ComparisonResult, 'passed' | 'message'> = {
        filePath: comparisonFilePath,
        newScreenshot: receivedScreenshot,
    };

    if (!existsSync(comparisonFilePath)) {
        await writeFile(comparisonFilePath, receivedScreenshot);
        return {
            ...initialResult,
            passed: false,
            message:
                'Comparison screenshot file is missing. Wrote current image instead of comparing.',
        };
    }

    const expected = await readFile(comparisonFilePath);

    const expectedMimeType = mime.getType(comparisonFilePath) ?? 'application/octet-string';
    const comparator = getComparator(expectedMimeType);

    const result = comparator(receivedScreenshot, expected, comparisonOptions);

    if (result) {
        await writeFile(comparisonFilePath, receivedScreenshot);
        return {
            ...initialResult,
            message: 'Screenshot differed from comparison image file.',
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
