# web-test-runner-screenshot

A plugin that runs a screenshot comparisons for [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/).

## Install

You probably want this as a dev dependency:

```bash
npm i -D web-test-runner-screenshot
```

## Plugin assignment

In your [web-test-runner config](https://modern-web.dev/docs/test-runner/cli-and-configuration/#configuration-file) you need to add this package as a plugin. Example for `web-test-runner.config.mjs`:

```javascript
import {screenshotPlugin} from 'web-test-runner-screenshot/plugin/plugin.js';

const baseScreenshotsDir = 'test-screenshots';

export default {
    plugins: [screenshotPlugin(baseScreenshotsDir)],
};
```

`baseScreenshotsDir` can be an empty string or omitted entirely, but that is recommended to give it a value. Otherwise, your directory will get cluttered with test images. (You could also provide a specific path when actually taking the screenshots, shown below, to prevent clutter.)

## Command usage

For ease of use, import the `assertScreenshot` command directly:

```Typescript
import {fixture, html} from '@open-wc/testing';
import {assertScreenshot} from 'web-test-runner-screenshot/command';

describe('my test', () => {
    it('should do something', async () => {
        const rendered = await fixture(html`
            <div class="screenshot-me">hello there</div>
        `);

        await assertScreenshot({
            selector: '.screenshot-me',
            path: 'my-screenshot.png',
        });
    });
});
```

`assertScreenshot` automatically asserts that the screenshots are equal whereas another command, `compareScreenshot`, gives you a result of the comparison which you could use to write your own test function.

## Note on `@web/test-runner-visual-regression`

This is very similar to the [`@web/test-runner-visual-regression`](https://www.npmjs.com/package/@web/test-runner-visual-regression) package in purpose. I like the API of my package here better though. Of course you should feel free to use whichever you want.
