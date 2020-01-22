export async function insertImage(image: File | string, containerId: string) {
  const previousImg = document.querySelector(`#${containerId} img`);
  if (previousImg) {
    previousImg.remove();
  }

  const img = document.createElement('img');
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.appendChild(img);

  try {
    img.src = typeof image === 'string' ? image : (await getImageData(image)).url;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
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

type ImageData = {
  name: string;
  url: string;
  width: number;
  height: number;
};

export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export async function getImageData(imgFile: File): Promise<ImageData> {
  const dataUri = await blobToDataUri(imgFile);
  const img = await preloadImage(dataUri);

  return {
    name: imgFile.name,
    url: dataUri,
    width: img.width,
    height: img.height,
  };
}

export function blobToFile(blob: Blob, fileName: string) {
  const file = blob as any;
  file.lastModified = new Date();
  file.name = fileName;
  return file as File;
}
