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

export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export async function getImageDataFromFile(imgFile: File) {
  const img = await preloadImage(URL.createObjectURL(imgFile));

  return {
    name: imgFile.name,
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
