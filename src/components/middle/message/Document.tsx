import React, { FC } from '../../../lib/teact/teact';

import { ApiDocument } from '../../../api/types';
import { getDocumentInfo } from '../../../util/documentInfo';

import './Document.scss';

type IProps = {
  document: ApiDocument;
};

const Document: FC<IProps> = ({ document }) => {
  const { size, extension, color } = getDocumentInfo(document);
  const { fileName } = document;

  return (
    <div className="document-content not-implemented">
      <div className={`document-icon ${color}`}>
        {extension.length <= 4 && (
          <span className="document-ext">{extension}</span>
        )}
      </div>
      <div className="document-info">
        <div className="document-filename">{fileName}</div>
        <div className="document-size">{size}</div>
      </div>
    </div>
  );
};

export default Document;
