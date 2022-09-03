import {isObject, typedHasOwnProperty} from 'augment-vir';
import {CompareScreenshotCommandPayload} from './compare-screenshot-payload';

export function isValidCompareScreenshotPayload(
    input: unknown,
): input is CompareScreenshotCommandPayload {
    if (!isObject(input)) {
        return false;
    }

    if (!typedHasOwnProperty(input, 'path')) {
        return false;
    }

    return true;
}

export function verifyCompareScreenshotPayload(
    input: unknown,
): asserts input is CompareScreenshotCommandPayload {
    if (!isObject(input)) {
        throw new Error(
            `Missing correct payload input to compare screenshot command. Expected an object.`,
        );
    }

    if (!typedHasOwnProperty(input, 'path')) {
        throw new Error(
            `Missing correct payload input to compare screenshot command. Expected an object with a path property.`,
        );
    }
}
