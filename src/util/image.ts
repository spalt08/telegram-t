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

type ImageData = {
  name: string;
  url: string;
  width: number;
  height: number;
};

export function getImageData(imgFile: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const { result } = e.target || {};
      if (typeof result !== 'string') {
        reject(new Error('Unknown src format'));
      } else {
        const img = new Image();
        img.src = result;
        img.onload = () => {
          resolve({
            name: imgFile.name,
            url: result,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = () => reject(new Error('Error while loading image'));
      }
    };
    reader.onerror = () => reject(new Error('Error while reading image'));
    reader.readAsDataURL(imgFile);
  });
}

export function blobToFile(blob: Blob, fileName: string) {
  const file = blob as any;
  file.lastModified = new Date();
  file.name = fileName;
  return file as File;
}
