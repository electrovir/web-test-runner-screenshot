// make sure this import is from the compiled JS files, not the packages/command source files
import {assert} from '@open-wc/testing';
import {extractErrorMessage} from 'augment-vir';
import {
    compareScreenshot,
    compareScreenshotCommandName,
    CompareScreenshotCommandPayload,
    comparisonMessages,
    ComparisonResult,
} from '../../command';

type TestResult = Omit<ComparisonResult, 'file'>;
type TestCase = {
    testName: string;
    payload: CompareScreenshotCommandPayload;
} & (
    | {
          expect: TestResult;
      }
    | {
          error: string;
      }
);

async function testOutput(payload: CompareScreenshotCommandPayload, expected: TestResult) {
    const actual = await compareScreenshot(payload);

    assert(actual.file.endsWith('.png'), `output screenshot ${actual.file} did not end with .png`);

    assert.deepStrictEqual(
        {
            ...expected,
            file: undefined,
        },
        {
            ...actual,
            file: undefined,
        },
    );
}

describe(compareScreenshotCommandName, () => {
    const compareTestCases: TestCase[] = [
        {
            testName: 'should pass with basic comparison',
            expect: {
                message: comparisonMessages.matched,
                dir: 'test-screenshots/basic-image',
                passed: true,
            },
            payload: {
                path: 'basic-image.png',
            },
        },
        {
            testName: 'should pass without file extension',
            expect: {
                message: comparisonMessages.matched,
                dir: 'test-screenshots/no-extension',
                passed: true,
            },
            payload: {
                path: 'no-extension',
            },
        },
        {
            testName: 'should fail with non-png extension',
            error: 'Error while executing command compare-screenshot with payload {"path":"wrong-extension.jpg"}: Only png screenshots are allowed. Got "jpg". Please change your file extension to "png"',
            payload: {
                path: 'wrong-extension.jpg',
            },
        },
    ];

    compareTestCases.forEach((testCase) => {
        it(testCase.testName, async () => {
            if ('expect' in testCase) {
                await testOutput(testCase.payload, testCase.expect);
            } else {
                let thrownError: unknown;
                try {
                    await testOutput(testCase.payload, {} as any);
                } catch (error) {
                    thrownError = error;
                }
                assert.strictEqual(testCase.error, extractErrorMessage(thrownError));
            }
        });
    });
});
