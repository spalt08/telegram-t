import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getDocumentInfo } from '../../../util/documentInfo';
import { getMessageTransferParams } from '../../../modules/helpers';

import File from '../../common/File';

type IProps = {
  message: ApiMessage;
  fileTransferProgress?: number;
  onCancelTransfer?: () => void;
};

const Document: FC<IProps> = ({ message, fileTransferProgress, onCancelTransfer }) => {
  const document = message.content.document!;
  const { extension } = getDocumentInfo(document);
  const { fileName, size } = document;

  const { isUploading, isDownloading, transferProgress } = getMessageTransferParams(message, fileTransferProgress);

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
