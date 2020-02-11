import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiDocument, ApiMessage } from '../../../api/types';

import { getDocumentExtension } from '../../../util/documentInfo';
import { getMessageAudio } from '../../../modules/helpers';

import File from '../../common/File';

type IProps = {
  message: ApiMessage;
};

const Audio: FC<IProps> = ({ message }) => {
  const document = getMessageAudio(message) as ApiDocument;

  return (
    <File size={document.size} name={document.fileName} smaller extension={getDocumentExtension(document)} />
  );
};

export default memo(Audio);
