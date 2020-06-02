import { pause } from '../util/schedulers';
import generateIdFor from '../util/generateIdFor';
import { DEBUG } from '../config';

declare const self: ServiceWorkerGlobalScope;

type PartInfo = {
  type: 'PartInfo';
  arrayBuffer: ArrayBuffer;
  mimeType: 'string';
  fullSize: number;
};

type RequestStates = {
  resolve: (response: PartInfo) => void;
  reject: () => void;
};

const DEFAULT_PART_SIZE = 512 * 1024; // 512 kB
const PART_TIMEOUT = 10000;

const requestStates: Record<string, RequestStates> = {};

export async function respondForProgressive(e: FetchEvent) {
  const { url } = e.request;

  if (!url.includes('/progressive/')) {
    return fetch(e.request);
  }

  const range = e.request.headers.get('range');
  const bytes = /^bytes=(\d+)-(\d+)?$/g.exec(range || '')!;
  const start = Number(bytes[1]);

  let end = Number(bytes[2]);
  if (!end || (end - start + 1) > DEFAULT_PART_SIZE) {
    end = start + DEFAULT_PART_SIZE - 1;
  }

  const partInfo = await requestPart(e, { url, start, end });
  if (!partInfo) {
    return new Response('', {
      status: 500,
      statusText: 'Failed to fetch progressive part',
    });
  }

  const { arrayBuffer, fullSize, mimeType } = partInfo;

  const partSize = Math.min(end - start + 1, arrayBuffer.byteLength);
  end = start + partSize - 1;

  return new Response(arrayBuffer.slice(0, partSize), {
    status: 206,
    statusText: 'Partial Content',
    headers: [
      ['Content-Range', `bytes ${start}-${end}/${fullSize}`],
      ['Accept-Ranges', 'bytes'],
      ['Content-Length', String(partSize)],
      ['Content-Type', mimeType],
    ],
  });
}

self.addEventListener('message', (e) => {
  const { type, messageId, result } = e.data as {
    type: string;
    messageId: string;
    result: PartInfo;
  };

  if (type === 'partResponse' && requestStates[messageId]) {
    requestStates[messageId].resolve(result);
  }
});

async function requestPart(
  e: FetchEvent,
  params: { url: string; start: number; end: number },
): Promise<PartInfo | undefined> {
  if (!e.clientId) {
    return undefined;
  }

  // eslint-disable-next-line no-restricted-globals
  const client = await self.clients.get(e.clientId);
  if (!client) {
    return undefined;
  }

  const messageId = generateIdFor(requestStates);
  requestStates[messageId] = {} as RequestStates;

  const promise = Promise.race([
    pause(PART_TIMEOUT).then(() => {
      if (DEBUG) {
        // eslint-disable-next-line no-console
        console.error('Progressive part timeout');
      }
    }) as Promise<undefined>,
    new Promise<PartInfo>((resolve, reject) => {
      Object.assign(requestStates[messageId], { resolve, reject });
    }),
  ]);

  promise.then(
    () => {
      delete requestStates[messageId];
    },
    () => {
      delete requestStates[messageId];
    },
  );

  client.postMessage({
    type: 'requestPart',
    messageId,
    params,
  });

  return promise;
}
