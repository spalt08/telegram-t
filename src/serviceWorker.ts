import { DEBUG } from './config';
import { respondForProgressive } from './serviceWorker/progressive';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (e) => {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('ServiceWorker installed');
  }

  // Activate worker immediately
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('ServiceWorker activated');
  }

  // Become available to all pages
  e.waitUntil(self.clients.claim());
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', (e: FetchEvent) => {
  e.respondWith((() => {
    const { url } = e.request;

    if (url.includes('/progressive/')) {
      return respondForProgressive(e);
    }

    return fetch(e.request);
  })());
});
