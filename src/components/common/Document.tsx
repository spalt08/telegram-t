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

  const [isDownloadAllowed, setIsDownloadAllowed] = useState(false);
  const {
    mediaData, downloadProgress,
  } = useMediaWithDownloadProgress(getMessageMediaHash(message), !isDownloadAllowed);
  const {
    isUploading, isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, isDownloadAllowed);

  const hasPreview = getDocumentHasPreview(document);
  const localBlobUrl = hasPreview ? document.previewBlobUrl : undefined;
  const thumbDataUri = hasPreview ? getMessageMediaThumbDataUri(message) : undefined;
  const previewData = useMedia(getMessageMediaHash(message, 'pictogram'), !load);

  const handleClick = useCallback(() => {
    if (isUploading) {
      if (onCancelUpload) {
        onCancelUpload();
      }
    } else {
      setIsDownloadAllowed((isAllowed) => !isAllowed);
    }
  }, [isUploading, onCancelUpload]);

  useEffect(() => {
    if (isDownloadAllowed && mediaData) {
      download(mediaData, fileName);
      setIsDownloadAllowed(false);
    }
  }, [fileName, mediaData, isDownloadAllowed]);

  return (
    <File
      name={fileName}
      extension={extension}
      size={size}
      timestamp={showTimeStamp ? timestamp : undefined}
      thumbnailDataUri={thumbDataUri}
      previewData={localBlobUrl || previewData}
      smaller={smaller}
      isTransferring={isTransferring}
      isUploading={isUploading}
      transferProgress={transferProgress}
      onClick={handleClick}
    />
  );
};

export default Document;
