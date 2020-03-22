import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getDocumentInfo } from '../../common/helpers/documentInfo';
import { getMediaTransferState } from '../../../modules/helpers';

import File from '../../common/File';

type IProps = {
  message: ApiMessage;
  uploadProgress?: number;
  onCancelTransfer?: () => void;
};

const Document: FC<IProps> = ({ message, uploadProgress, onCancelTransfer }) => {
  const document = message.content.document!;
  const { extension } = getDocumentInfo(document);
  const { fileName, size } = document;

  const {
    isUploading, isDownloading, transferProgress,
  } = getMediaTransferState(message, uploadProgress, false);

  return (
    <File
      className={!(isUploading || isDownloading) ? 'not-implemented' : ''}
      name={fileName}
      extension={extension}
      size={size}
      isUploading={isUploading}
      isDownloading={isDownloading}
      transferProgress={transferProgress}
      onCancelTransfer={onCancelTransfer}
    />
  );
};

export default Document;
