/* eslint-disable no-console */

import { ConsoleMessage } from 'puppeteer';

// For some reason this definitions file is not included when running with `ts-node`.
// @ts-ignore
import { WindowWithPerf } from '../../@types/global.d';

const path = require('path');
const puppeteer = require('puppeteer');

const globalState = require('./globals/0c46207b-1000.json');
// const HEAVY_CHAT_ID = -1186709966;

(async () => {
  // eslint-disable-next-line no-constant-condition
  while (1) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('----------');

    page.on('console', (message: ConsoleMessage) => {
      console.log('[APP]', message.text());
    });
    page.on('pageerror', console.error);

    await page.goto('http://localhost:1234', { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(evaluateFn, globalState);
    console.log(result);

    await page.screenshot({ path: path.resolve(__dirname, 'screenshot.png') });
    await browser.close();
  }
})();

function evaluateFn(_globalState: typeof globalState) {
  function pause(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  }

  const { perf: app } = window as WindowWithPerf;

  app.setGlobal(_globalState, false);

  // Pause here is to avoid `setGlobal` callbacks on newly rendered tree.
  return pause(100).then(() => {
    let renderTime = 0;
    let effectsTime = 0;

    const effectsPromise = new Promise((resolve) => {
      app.onMessageListEffectsDone = resolve;
    });

    renderTime = Date.now();
    const virtualTreeSize = app.renderApp();
    renderTime = Date.now() - renderTime;
    effectsTime = Date.now();

    return effectsPromise.then(() => {
      effectsTime = Date.now() - effectsTime;

      return { renderTime, virtualTreeSize, effectsTime };
    });
  });
}
