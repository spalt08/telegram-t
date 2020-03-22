// eslint-disable-next-line no-restricted-globals
const cacheApi = self.caches;

export enum Type {
  Text,
  Blob,
  Json,
}

export async function fetch(cacheName: string, key: string, type: Type) {
  const request = new Request(key);
  const cache = await cacheApi.open(cacheName);
  const cached = await cache.match(request);
  if (!cached) {
    return null;
  }

  switch (type) {
    case Type.Text:
      return cached.text();
    case Type.Blob:
      return cached.blob();
    case Type.Json:
      return cached.json();
  }

  return null;
}

export async function save(cacheName: string, key: string, data: AnyLiteral | Blob | string) {
  const cacheData = typeof data === 'string' || data instanceof Blob ? data : JSON.stringify(data);
  const request = new Request(key);
  const response = new Response(cacheData);
  const cache = await cacheApi.open(cacheName);
  return cache.put(request, response);
}
