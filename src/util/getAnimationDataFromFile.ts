let pako: typeof import('pako/dist/pako_inflate');

export default async function getAnimationDataFromFile(path: string) {
  if (!pako) {
    pako = await import('pako/dist/pako_inflate');
  }

  const file = await fetch(path);
  const buffer = await file.arrayBuffer();
  const json = pako.inflate(buffer, { to: 'string' });

  return JSON.parse(json);
}
