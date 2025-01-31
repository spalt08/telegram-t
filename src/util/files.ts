import { pause } from './schedulers';

// Polyfill for Safari: `File` is not available in web worker
if (typeof File === 'undefined') {
  // eslint-disable-next-line no-global-assign, no-restricted-globals, func-names
  self.File = class extends Blob {
    name: string;

    constructor(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) {
      if (options) {
        const { type, ...rest } = options;
        super(fileBits, { type });
        Object.assign(this, rest);
      } else {
        super(fileBits);
      }

      this.name = fileName;
    }
  } as typeof File;
}

export function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const { result } = e.target || {};
      if (typeof result === 'string') {
        resolve(result);
      }

      reject(new Error('Failed to read blob'));
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function blobToFile(blob: Blob, fileName: string) {
  return new File([blob], fileName, {
    lastModified: Date.now(),
    type: blob.type,
  });
}

export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function preloadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.volume = 0;
    video.onloadedmetadata = () => resolve(video);
    video.onerror = reject;
    video.src = url;
  });
}

export async function createPosterForVideo(url: string): Promise<string | undefined> {
  const video = await preloadVideo(url);

  return Promise.race([
    pause(2000) as Promise<undefined>,
    new Promise<string>((resolve, reject) => {
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      video.onerror = reject;
      video.currentTime = Math.min(video.duration, 1);
    }),
  ]);
}

export async function fetchBlob(blobUrl: string) {
  const response = await fetch(blobUrl);
  return response.blob();
}

export async function fetchFile(blobUrl: string, fileName: string) {
  const blob = await fetchBlob(blobUrl);
  return blobToFile(blob, fileName);
}
