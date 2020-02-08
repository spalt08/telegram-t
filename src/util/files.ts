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
  const file = blob as any;
  file.lastModified = new Date();
  file.name = fileName;
  return file as File;
}

export async function getImageDataFromFile(file: File) {
  const blobUrl = URL.createObjectURL(file);
  const { width, height } = await preloadImage(blobUrl);

  return {
    blobUrl,
    width,
    height,
  };
}

export async function getVideoDataFromFile(file: File) {
  const blobUrl = URL.createObjectURL(file);
  const { videoWidth: width, videoHeight: height } = await preloadVideo(blobUrl);

  return {
    blobUrl,
    width,
    height,
  };
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
