// make sure this import is from the compiled JS files, not the packages/command source files
import {assert} from '@open-wc/testing';
import {getObjectTypedKeys} from 'augment-vir';
import {compareScreenshot, CompareScreenshotCommandPayload, ComparisonResult} from '../../command';
import {compareScreenshotCommandName} from '../shared/command-name';

async function testOutput(
    payload: CompareScreenshotCommandPayload,
    expected: Partial<ComparisonResult>,
) {
    const result = await compareScreenshot(payload);

    const expectationKeys = getObjectTypedKeys(expected);

    assert(expectationKeys.length > 0, 'Need at least one expectation.');

    expectationKeys.forEach((key) => {
        const expectation = expected[key];
        const actual = result[key];

        assert.strictEqual(
            actual,
            expectation,
            `Result failed to meet expectation for "${key}" key`,
        );
    });
}

type TestCase = {
    testName: string;
    payload: CompareScreenshotCommandPayload;
    expect: Partial<ComparisonResult>;
};

describe(compareScreenshotCommandName, () => {
    const compareTestCases: TestCase[] = [
        {
            testName: 'should pass with basic comparison',
            expect: {
                passed: true,
            },
            payload: {
                path: 'basic-image.png',
            },
        },
        {
            testName: 'should pass without file extension',
            expect: {
                passed: true,
            },
            payload: {
                path: 'no-extension',
            },
        },
    ];

    compareTestCases.forEach((testCase) => {
        it(testCase.testName, async () => {
            await testOutput(testCase.payload, testCase.expect);
        });
    });
});
