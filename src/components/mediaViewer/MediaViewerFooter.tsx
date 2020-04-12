import React, { FC, useEffect, useState } from '../../lib/teact/teact';
import { throttle } from '../../util/schedulers';
import { TextPart } from '../common/helpers/renderMessageText';
import { REM } from '../common/helpers/mediaDimensions';

import './MediaViewerFooter.scss';

const RESIZE_THROTTLE_MS = 500;

type OwnProps = {
  text: TextPart | TextPart[];
};

const MediaViewerFooter: FC<OwnProps> = ({ text = '' }) => {
  const [isMultiline, setIsMultiline] = useState(false);
  useEffect(() => {
    const footerContent = document.querySelector('.MediaViewerFooter .media-text') as HTMLDivElement | null;

    const checkIsMultiline = () => {
      const height = footerContent ? footerContent.clientHeight : 0;

      setIsMultiline(height > REM * 2);
    };

    // First run for initial detection of multiline footer text
    checkIsMultiline();

    const handleResize = throttle(checkIsMultiline, RESIZE_THROTTLE_MS, true);

    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, []);

  function stopEvent(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (text) {
      e.stopPropagation();
    }
  }

  return (
    <div className="MediaViewerFooter" onClick={stopEvent}>
      {text && (
        <div className="media-viewer-footer-content">
          <p className={`media-text custom-scroll ${isMultiline ? 'multiline' : ''}`}>{text}</p>
        </div>
      )}
    </div>
  );
};

export default MediaViewerFooter;
