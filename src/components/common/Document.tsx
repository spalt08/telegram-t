import React, {
  FC, useCallback, useEffect, useState,
} from '../../lib/teact/teact';

import { ApiMessage } from '../../api/types';

import { getDocumentInfo } from './helpers/documentInfo';
import { getMediaTransferState, getMessageMediaHash } from '../../modules/helpers';
import useMediaWithDownloadProgress from '../../hooks/useMediaWithDownloadProgress';
import download from '../../util/download';

import File from './File';

type IProps = {
  message: ApiMessage;
  smaller?: boolean;
  uploadProgress?: number;
  onCancelUpload?: () => void;
};

const Document: FC<IProps> = ({
  message, smaller, uploadProgress, onCancelUpload,
}) => {
  const document = message.content.document!;
  const { extension } = getDocumentInfo(document);
  const { fileName, size } = document;

  const [shouldDownload, setShouldDownload] = useState();
  const { mediaData, downloadProgress } = useMediaWithDownloadProgress(getMessageMediaHash(message), !shouldDownload);
  const {
    isUploading, isDownloading, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, shouldDownload);

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
      smaller={smaller}
      isUploading={isUploading}
      isDownloading={isDownloading}
      transferProgress={transferProgress}
      onClick={isUploading ? onCancelUpload : handleDownload}
    />
  );
};

export default Document;
