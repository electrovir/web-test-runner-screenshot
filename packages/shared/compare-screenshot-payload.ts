import {PageScreenshotOptions} from 'playwright-core';

export type ImageComparatorOptions = {
    threshold?: number;
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    accountForAntiAliasing?: boolean;
};

export type ScreenshotOptions = Omit<PageScreenshotOptions, 'mask' | 'type' | 'path' | 'quality'>;

export enum UpdateScreenshotFileStrategyEnum {
    /** Overwrite all screenshot files. This is the default behavior. */
    All = 'all',
    /** Don't write any screenshot files, even ones that are missing. */
    None = 'none',
    /** Only write screenshot files that are missing. */
    Missing = 'missing',
}

export type CompareInputsSharedWithPayload = {
    path: string | [string, ...string[]];
    updateScreenshotFileStrategy?: UpdateScreenshotFileStrategyEnum;
} & ScreenshotOptions &
    ImageComparatorOptions;

export type CompareScreenshotCommandPayload = {
    selector?: string | undefined;
} & CompareInputsSharedWithPayload;
