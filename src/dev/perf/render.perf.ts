/* eslint-disable no-console */

import { ConsoleMessage } from 'puppeteer';
// For some reason this definitions file is not included when running with `ts-node`.
// @ts-ignore
import { WindowWithPerf } from '../../@types/global.d';
import { GlobalState } from '../../store/types';
import { ApiMessage } from '../../api/types';

const puppeteer = require('puppeteer');

const globalState = require('./globals/0c46207b-1000.json');

function pause(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

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
    await page.evaluate(setupPage, globalState);

    const initialRender = await page.evaluate(initialRenderFn);
    console.log('Initial render', JSON.stringify(initialRender));

    // await page.screenshot({ path: path.resolve(__dirname, 'screenshot1.png') });

    // For some reason we need to wait for some actions caused by previous rendering.
    await pause(1000);

    const prependRender = await page.evaluate(prependRenderFn);
    console.log('Prepend render', JSON.stringify(prependRender));

    // await page.screenshot({ path: path.resolve(__dirname, 'screenshot2.png') });

    await browser.close();
  }
})();

function setupPage(_globalState: typeof globalState) {
  const HEAVY_CHAT_ID = -1186709966;

  const { perf: app } = window as WindowWithPerf;

  // Not sure how to properly use the upper declaration here.
  function browserPause(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  }

  function countDomNodes(current: Node): number {
    return 1 + Array.from(current.childNodes).map(countDomNodes).reduce((total, childCount) => {
      return total + childCount;
    }, 0);
  }

  function pick(source: AnyLiteral, keys: string[]) {
    return keys.reduce((collection: AnyLiteral, key) => {
      collection[key] = source[key];
      return collection;
    }, {});
  }

  function setHeavyMessages(messagesById: Record<string, ApiMessage>) {
    const currentGlobal = app.getGlobal();

    app.setGlobal({
      ...currentGlobal,
      messages: {
        ...currentGlobal.messages,
        byChatId: {
          ...currentGlobal.messages.byChatId,
          [HEAVY_CHAT_ID]: {
            byId: messagesById,
          },
        },
      },
    } as GlobalState);
  }

  const allMessagesById = _globalState.messages.byChatId[HEAVY_CHAT_ID].byId;
  const messageIds = Object.keys(allMessagesById).map(Number).sort();
  const oldest150ById = pick(allMessagesById, messageIds.slice(0, 150).map(String));
  const newest850ById = pick(allMessagesById, messageIds.slice(150).map(String));

  Object.assign(app, {
    pause: browserPause,
    countDomNodes,
    setHeavyMessages,
    messageChunks: {
      allMessagesById,
      oldest150ById,
      newest850ById,
    },
  });

  app.setGlobal(_globalState);
  setHeavyMessages(newest850ById);

  // Pause here is to avoid `setGlobal` callbacks on further rendered tree.
  return browserPause(100);
}

function initialRenderFn() {
  const { perf: app } = window as WindowWithPerf;


  const renderingEndPromise = new Promise(requestAnimationFrame);

  let renderTime = Date.now();
  const virtualTreeSize = app.renderApp();
  renderTime = Date.now() - renderTime;

  let frameTime = Date.now();
  return renderingEndPromise.then(() => {
    frameTime = Date.now() - frameTime;

    const domElements = document.querySelectorAll('*').length;
    const domNodes = app.countDomNodes(document.body);

    return {
      renderTime, frameTime, virtualTreeSize, domElements, domNodes,
    };
  });
}

function prependRenderFn() {
  const { perf: app } = window as WindowWithPerf;

  let frameTime = 0;

  app.setHeavyMessages(app.messageChunks.allMessagesById);

  const renderingStartPromise = new Promise(requestAnimationFrame);
  return renderingStartPromise.then(() => {
    frameTime = Date.now();
    return new Promise(requestAnimationFrame);
  }).then(() => {
    frameTime = Date.now() - frameTime;

    const domElements = document.querySelectorAll('*').length;
    const domNodes = app.countDomNodes(document.body);

    return {
      frameTime, domElements, domNodes,
    };
  });
}
