import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiDocument, ApiMessage } from '../../../api/types';

import { getDocumentExtension } from '../../../util/documentInfo';
import { getMessageDocument } from '../../../modules/helpers';

import File from '../../common/File';

type IProps = {
  message: ApiMessage;
};

const Document: FC<IProps> = ({ message }) => {
  const document = getMessageDocument(message)!;

  return (
    <File
      size={document.size}
      name={document.fileName}
      smaller
      extension={getDocumentExtension(document)}
      className="not-implemented"
    />
  );
};

export default memo(Document);
