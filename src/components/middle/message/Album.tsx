import React, { FC, useMemo, useCallback } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { getMessageContent, IDimensions } from '../../../modules/helpers';
import { calculateMediaDimensions } from './helpers/mediaDimensions';
import buildClassName from '../../../util/buildClassName';
import { IAlbum } from '../../../types';

import Photo from './Photo';
import Video from './Video';

import './Album.scss';

type IProps = {
  album: IAlbum;
  loadAndPlay?: boolean;
  onMediaClick: (messageId: number) => void;
};

const Album: FC<IProps> = ({
  album,
  loadAndPlay,
  onMediaClick,
}) => {
  const albumMediaParams = useMemo(() => {
    const mediaCount = album.messages.length;
    const albumMediaDimensions = album.messages.map(
      (message) => calculateMediaDimensions(message) as IDimensions,
    );

    const isVerticalLayout = mediaCount === 2
      && albumMediaDimensions.every(({ width, height }) => width > height);

    const columnCount = (mediaCount > 3 && mediaCount < 7) || mediaCount >= 9 ? 3 : 2;

    return {
      mediaCount,
      columnCount,
      isVerticalLayout,
    };
  }, [album.messages]);

  // This shrinks down the album height,
  // if one of two horizontally placed photos is much less tall than the other
  const containerStyle = useMemo(() => {
    if (albumMediaParams.mediaCount !== 2 || albumMediaParams.isVerticalLayout) {
      return '';
    }
    let style = '';
    const trueMediaDimensions = album.messages.map(
      (message) => calculateMediaDimensions(message, albumMediaParams) as IDimensions,
    );

    const minHeight = trueMediaDimensions
      .map(({ height }) => height)
      .reduce((min, height) => (height < min ? height : min), Infinity);

    if (minHeight !== Infinity) {
      style += `height: ${minHeight}px;`;
    }

    return style;
  }, [album.messages, albumMediaParams]);

  const getMediaParams = useCallback((index: number) => {
    const { mediaCount, columnCount, isVerticalLayout } = albumMediaParams;
    const isFullWidth = isVerticalLayout
      || (mediaCount >= 3 && mediaCount <= 5 && (index === 0 || index === 4))
      || (mediaCount === 6 && index === 3)
      || (mediaCount >= 7 && mediaCount <= 9 && index === 0)
      || (mediaCount === 10 && index === 3);

    let adjustedColumnCount = columnCount;
    if (
      (mediaCount === 6 && index >= 4)
      || (mediaCount === 9 && index >= 4 && index <= 5)
    ) {
      adjustedColumnCount = 2;
    }
    if (mediaCount === 8 && index >= 1 && index <= 3) {
      adjustedColumnCount = 3;
    }

    return {
      ...albumMediaParams,
      isFullWidth,
      columnCount: adjustedColumnCount,
    };
  }, [albumMediaParams]);

  const { mediaCount, isVerticalLayout } = albumMediaParams;

  function renderAlbumMessage(message: ApiMessage, index: number) {
    const { photo, video } = getMessageContent(message);

    if (photo) {
      return (
        <Photo
          message={message}
          load={loadAndPlay}
          albumMediaParams={getMediaParams(index)}
          onClick={() => onMediaClick(message.id)}
        />
      );
    } else if (video) {
      return (
        <Video
          message={message}
          loadAndPlay={loadAndPlay}
          albumMediaParams={getMediaParams(index)}
          onClick={() => onMediaClick(message.id)}
        />
      );
    }

    return null;
  }

  const className = buildClassName(
    'Album',
    `item-count-${mediaCount}`,
    isVerticalLayout && 'vertical-layout',
  );

  return (
    <div
      className={className}
      // @ts-ignore
      style={containerStyle}
    >
      {album.messages.map(renderAlbumMessage)}
    </div>
  );
};

export default Album;
