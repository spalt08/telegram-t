import { ApiAttachment } from '../../../../api/types';
import { preloadImage, preloadVideo } from '../../../../util/files';

const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB

export default async function buildAttachment(
  filename: string, blob: Blob, isQuick: boolean, options?: Partial<ApiAttachment>,
): Promise<ApiAttachment> {
  const blobUrl = URL.createObjectURL(blob);
  const { type: mimeType, size } = blob;
  let quick;

  if (isQuick && size < MAX_QUICK_FILE_SIZE) {
    if (mimeType.startsWith('image/')) {
      const { width, height } = await preloadImage(blobUrl);
      quick = { width, height };
    } else {
      const { videoWidth: width, videoHeight: height } = await preloadVideo(blobUrl);
      quick = { width, height };
    }
  }

  return {
    blobUrl,
    filename,
    mimeType,
    size,
    quick,
    ...options,
  };
}
