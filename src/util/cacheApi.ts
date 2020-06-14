// eslint-disable-next-line no-restricted-globals
const cacheApi = self.caches;

export enum Type {
  Text,
  Blob,
  Json,
}

export async function fetch(cacheName: string, key: string, type: Type) {
  if (!cacheApi) {
    return undefined;
  }

  const request = new Request(key);
  const cache = await cacheApi.open(cacheName);
  const response = await cache.match(request);
  if (!response) {
    return undefined;
  }

  switch (type) {
    case Type.Text:
      return response.text();
    case Type.Blob: {
      const blob = await response.blob();

      // iOS Safari fails to preserve `type` in cache
      if (!blob.type) {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
          return new Blob([blob], { type: contentType });
        }
      }

      return blob;
    }
    case Type.Json:
      return response.json();
    default:
      return undefined;
  }
}

export async function save(cacheName: string, key: string, data: AnyLiteral | Blob | string) {
  if (!cacheApi) {
    return undefined;
  }

  const cacheData = typeof data === 'string' || data instanceof Blob ? data : JSON.stringify(data);
  const request = new Request(key);
  const response = new Response(cacheData);
  const cache = await cacheApi.open(cacheName);
  return cache.put(request, response);
}
