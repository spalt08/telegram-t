import { ApiAttachment } from '../../../../api/types';
import { preloadImage, preloadVideo, createPosterForVideo } from '../../../../util/files';

const MAX_QUICK_VIDEO_SIZE = 10 * 1024 ** 2; // 10 MB

export default async function buildAttachment(
  filename: string, blob: Blob, isQuick: boolean, options?: Partial<ApiAttachment>,
): Promise<ApiAttachment> {
  const blobUrl = URL.createObjectURL(blob);
  const { type: mimeType, size } = blob;
  let quick;
  let previewBlobUrl;

  // Videos under 10 MB display as regular videos in other clients regardless of chosen attachment option
  if (
    isQuick
    || (mimeType.startsWith('video/') && size < MAX_QUICK_VIDEO_SIZE)
  ) {
    if (mimeType.startsWith('image/')) {
      const { width, height } = await preloadImage(blobUrl);
      quick = { width, height };
    } else {
      const { videoWidth: width, videoHeight: height, duration } = await preloadVideo(blobUrl);
      quick = { width, height, duration };
      previewBlobUrl = await createPosterForVideo(blobUrl);
    }
  } else if (mimeType.startsWith('image/')) {
    previewBlobUrl = blobUrl;
  } else if (mimeType.startsWith('video/')) {
    previewBlobUrl = await createPosterForVideo(blobUrl);
  }

  return {
    blobUrl,
    filename,
    mimeType,
    size,
    quick,
    previewBlobUrl,
    ...options,
  };
}
