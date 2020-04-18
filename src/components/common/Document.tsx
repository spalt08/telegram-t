import React, {
  FC, useCallback, useEffect, useState,
} from '../../lib/teact/teact';

import { ApiMessage } from '../../api/types';

import { getDocumentExtension, getDocumentHasPreview } from './helpers/documentInfo';
import { getMediaTransferState, getMessageMediaHash, getMessageMediaThumbDataUri } from '../../modules/helpers';
import useMediaWithDownloadProgress from '../../hooks/useMediaWithDownloadProgress';
import useMedia from '../../hooks/useMedia';
import download from '../../util/download';

import File from './File';

type OwnProps = {
  message: ApiMessage;
  load?: boolean;
  smaller?: boolean;
  uploadProgress?: number;
  showTimeStamp?: boolean;
  onCancelUpload?: () => void;
};

const Document: FC<OwnProps> = ({
  message, load, smaller, uploadProgress, showTimeStamp, onCancelUpload,
}) => {
  const document = message.content.document!;
  const extension = getDocumentExtension(document) || '';
  const { fileName, size, timestamp } = document;

  const [shouldDownload, setShouldDownload] = useState();
  const { mediaData, downloadProgress } = useMediaWithDownloadProgress(getMessageMediaHash(message), !shouldDownload);
  const {
    isUploading, isDownloading, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, shouldDownload);

  const hasPreview = getDocumentHasPreview(document);
  const localBlobUrl = hasPreview ? document.previewBlobUrl : undefined;
  const thumbDataUri = hasPreview ? getMessageMediaThumbDataUri(message) : undefined;
  const previewData = useMedia(getMessageMediaHash(message, 'pictogram'), !load);

  // TODO Support canceling
  const handleDownload = useCallback(() => {
    setShouldDownload(true);
  }, []);

  useEffect(() => {
    if (shouldDownload && mediaData) {
      download(mediaData, fileName);
      setShouldDownload(false);
    }
  }, [fileName, mediaData, shouldDownload]);

  return (
    <File
      name={fileName}
      extension={extension}
      size={size}
      timestamp={showTimeStamp ? timestamp : undefined}
      thumbnailDataUri={thumbDataUri}
      previewData={localBlobUrl || previewData}
      smaller={smaller}
      isUploading={isUploading}
      isDownloading={isDownloading}
      transferProgress={transferProgress}
      onClick={isUploading ? onCancelUpload : handleDownload}
    />
  );
};

export default Document;
