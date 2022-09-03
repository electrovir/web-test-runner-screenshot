import type {BrowserLauncher} from '@web/test-runner-core';
import {safeMatch} from 'augment-vir';
import {mkdir} from 'fs/promises';
import {basename, dirname, join} from 'path';

const screenshotFilesUsedThisSession = new Set<string>();

export async function sanitizeScreenshotFilePath({
    givenPath,
    baseScreenshotDir,
    browser,
}: {
    givenPath: string | string[];
    baseScreenshotDir: string;
    browser: BrowserLauncher;
}): Promise<string> {
    const screenshotRelativePath = Array.isArray(givenPath) ? join(...givenPath) : givenPath;
    const givenFilePath = join(baseScreenshotDir, screenshotRelativePath);

    assertIsPngFileName(givenFilePath);
    const screenshotFilePath = addBrowserNameToFilePath(
        createSubDir(givenFilePath),
        browser.name.toLowerCase(),
    );

    await mkdir(dirname(screenshotFilePath), {recursive: true});
    if (screenshotFilesUsedThisSession.has(screenshotFilePath)) {
        throw new Error(
            `Each screenshot comparison must use a unique file name and path. This screenshot file was used in multiple comparisons: ${screenshotFilePath}`,
        );
    } else {
        screenshotFilesUsedThisSession.add(screenshotFilePath);
    }

    return screenshotFilePath;
}

const extensionRegExp = /\.(\w+)$/;

function createSubDir(imageFilePath: string): string {
    const imageName = basename(imageFilePath);

    const baseNameWithoutExtension = imageName.replace(extensionRegExp, '');
    const finalPath = join(dirname(imageFilePath), baseNameWithoutExtension, imageName);

    return finalPath;
}

function assertIsPngFileName(path: string): void {
    const extension = safeMatch(path, extensionRegExp)[1];
    if (extension) {
        if (extension.toLowerCase() !== 'png') {
            throw new Error(
                `Only png screenshots are allowed. Got "${extension}". Please change your file extension to "png"`,
            );
        }
    }
    // don't do anything if there is no extension; allow files without extensions. We'll automatically
    // append the png extension later.
}

function addBrowserNameToFilePath(filePath: string, browserName: string): string {
    if (filePath.match(extensionRegExp)) {
        return filePath.replace(extensionRegExp, `.${browserName}.$1`);
    } else {
        return filePath.concat(`.${browserName}.png`);
    }
}
