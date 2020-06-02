import { DEBUG } from '../config';
import { IS_SERVICE_WORKER_SUPPORTED } from './environment';

if (IS_SERVICE_WORKER_SUPPORTED) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('../serviceWorker.ts');

      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.log('ServiceWorker registered');
      }
    } catch (err) {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.error('ServiceWorker registration failed: ', err);
      }
    }
  });
}
