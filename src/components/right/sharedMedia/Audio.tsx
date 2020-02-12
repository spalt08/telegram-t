import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { getDocumentExtension } from '../../../util/documentInfo';
import { getMessageAudio } from '../../../modules/helpers';

import File from '../../common/File';

type IProps = {
  message: ApiMessage;
};

const Audio: FC<IProps> = ({ message }) => {
  const audio = getMessageAudio(message)!;

  return (
    <File size={audio.size} name={audio.fileName} smaller extension={getDocumentExtension(audio)} />
  );
};

export default memo(Audio);
