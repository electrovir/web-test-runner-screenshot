/**
 * Copyright Microsoft Corporation. All rights reserved. Modified by electrovir.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

// retrieved from playwright source code

import {PNG} from 'pngjs';
import {ImageComparatorOptions} from '../shared/compare-screenshot-payload';
import {pixelMatch} from './third-party/pixel-match';

export type ComparatorResult = {diff?: Buffer; errorMessage: string} | null;
export type Comparator = (
    actualBuffer: Buffer | string,
    expectedBuffer: Buffer,
    options?: any,
) => ComparatorResult;

export const imageComparator = comparePngImages;

function comparePngImages(
    actualBuffer: Buffer | string,
    expectedBuffer: Buffer,
    options: ImageComparatorOptions = {},
): ComparatorResult {
    if (!actualBuffer || !(actualBuffer instanceof Buffer))
        return {errorMessage: 'Actual result should be a Buffer.'};

    const actual = PNG.sync.read(actualBuffer);
    const expected = PNG.sync.read(expectedBuffer);
    if (expected.width !== actual.width || expected.height !== actual.height) {
        return {
            errorMessage: `Expected an image ${expected.width}px by ${expected.height}px, received ${actual.width}px by ${actual.height}px. `,
        };
    }
    const diff = new PNG({width: expected.width, height: expected.height});
    const count = pixelMatch(
        expected.data,
        actual.data,
        diff.data,
        expected.width,
        expected.height,
        {
            threshold: options.threshold ?? 0.2,
            includeAA: options.accountForAntiAliasing,
        },
    );

    const maxDiffPixels1 = options.maxDiffPixels;
    const maxDiffPixels2 =
        options.maxDiffPixelRatio !== undefined
            ? expected.width * expected.height * options.maxDiffPixelRatio
            : undefined;
    let maxDiffPixels;
    if (maxDiffPixels1 !== undefined && maxDiffPixels2 !== undefined)
        maxDiffPixels = Math.min(maxDiffPixels1, maxDiffPixels2);
    else maxDiffPixels = maxDiffPixels1 ?? maxDiffPixels2 ?? 0;
    const ratio = Math.ceil((count / (expected.width * expected.height)) * 100) / 100;
    return count > maxDiffPixels
        ? {
              errorMessage: `${count} pixels (ratio ${ratio.toFixed(
                  2,
              )} of all image pixels) are different`,
              diff: PNG.sync.write(diff),
          }
        : null;
}
