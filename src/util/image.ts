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
    const url = typeof image === 'string' ? image : (await getImageData(image)).url;
    img.src = url;
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

export async function getImageData(imgFile: File): Promise<ImageData> {
  const dataUri = await blobToDataUri(imgFile);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = dataUri;
    img.onload = () => {
      resolve({
        name: imgFile.name,
        url: dataUri,
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = reject;
  });
}

export function blobToFile(blob: Blob, fileName: string) {
  const file = blob as any;
  file.lastModified = new Date();
  file.name = fileName;
  return file as File;
}
