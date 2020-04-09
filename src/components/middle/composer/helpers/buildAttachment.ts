import { ApiAttachment } from '../../../../api/types';
import { getImageDataFromFile, getVideoDataFromFile } from '../../../../util/files';

const MAX_QUICK_FILE_SIZE = 10 * 1024 ** 2; // 10 MB

export default async function buildAttachment(file: File, isQuick: boolean): Promise<ApiAttachment> {
  if (!isQuick || file.size >= MAX_QUICK_FILE_SIZE) {
    return { file };
  }

  return {
    file,
    quick: file.type.startsWith('image/')
      ? await getImageDataFromFile(file)
      : await getVideoDataFromFile(file),
  };
}
