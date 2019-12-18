const cacheApi = window.caches;

export async function fetch(cacheName: string, key: string, asBlob?: false): Promise<string | null>;
export async function fetch(cacheName: string, key: string, asBlob?: true): Promise<Blob | null>;
export async function fetch(cacheName: string, key: string, asBlob = false) {
  const request = new Request(key);
  const cache = await cacheApi.open(cacheName);
  const cached = await cache.match(request);
  if (!cached) {
    return null;
  }
  return asBlob ? cached.blob() : cached.text();
}

export async function save(cacheName: string, key: string, data: string | Blob) {
  const request = new Request(key);
  const response = new Response(data);
  const cache = await cacheApi.open(cacheName);
  return cache.put(request, response);
}
