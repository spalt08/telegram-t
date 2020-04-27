import BigInt from 'big-integer';
import { Api as GramJs } from '../../../lib/gramjs';

import { generateRandomBytes, readBigIntFromBuffer } from '../../../lib/gramjs/Helpers';
import {
  ApiSticker,
  ApiVideo,
  ApiNewPoll,
  ApiMessageEntity,
  ApiMessageEntityTypes,
} from '../../types';
import localDb from '../localDb';
import { pick } from '../../../util/iteratees';

const WAVEFORM_LENGTH = 63;
const WAVEFORM_MAX_VALUE = 255;

export function getEntityTypeById(chatOrUserId: number) {
  if (chatOrUserId > 0) {
    return 'user';
  } else if (chatOrUserId <= -1000000000) {
    return 'channel';
  } else {
    return 'chat';
  }
}

export function buildPeer(chatOrUserId: number): GramJs.TypePeer {
  if (chatOrUserId > 0) {
    return new GramJs.PeerUser({
      userId: chatOrUserId,
    });
  } else if (chatOrUserId <= -1000000000) {
    return new GramJs.PeerChannel({
      channelId: -chatOrUserId,
    });
  } else {
    return new GramJs.PeerChat({
      chatId: -chatOrUserId,
    });
  }
}

export function buildInputPeer(chatOrUserId: number, accessHash?: string): GramJs.TypeInputPeer {
  if (chatOrUserId > 0 || chatOrUserId <= -1000000000) {
    return chatOrUserId > 0
      ? new GramJs.InputPeerUser({
        userId: chatOrUserId,
        accessHash: BigInt(accessHash!),
      })
      : new GramJs.InputPeerChannel({
        channelId: -chatOrUserId,
        accessHash: BigInt(accessHash!),
      });
  } else {
    return new GramJs.InputPeerChat({
      chatId: -chatOrUserId,
    });
  }
}

export function buildInputEntity(chatOrUserId: number, accessHash?: string) {
  if (chatOrUserId > 0) {
    return new GramJs.InputUser({
      userId: chatOrUserId,
      accessHash: BigInt(accessHash!),
    });
  } else if (chatOrUserId <= -1000000000) {
    return new GramJs.InputChannel({
      channelId: -chatOrUserId,
      accessHash: BigInt(accessHash!),
    });
  } else {
    return -chatOrUserId;
  }
}

export function buildInputStickerSet(id: string, accessHash: string) {
  return new GramJs.InputStickerSetID({
    id: BigInt(id),
    accessHash: BigInt(accessHash),
  });
}

export function buildInputMediaDocument(media: ApiSticker | ApiVideo) {
  const document = localDb.documents[media.id];

  if (!document) {
    return undefined;
  }

  const inputDocument = new GramJs.InputDocument(pick(document, [
    'id',
    'accessHash',
    'fileReference',
  ]));

  return new GramJs.InputMediaDocument({ id: inputDocument });
}

export function buildInputPoll(pollParams: ApiNewPoll, randomId: BigInt.BigInteger) {
  const { summary, quiz } = pollParams;

  const poll = new GramJs.Poll({
    id: randomId,
    question: summary.question,
    answers: summary.answers.map(({ text, option }) => new GramJs.PollAnswer({ text, option: Buffer.from(option) })),
    quiz: summary.quiz,
  });

  if (!quiz) {
    return new GramJs.InputMediaPoll({ poll });
  }

  const correctAnswers = quiz.correctAnswers.map((key) => Buffer.from(key));
  const { solution } = quiz;
  const solutionEntities = quiz.solutionEntities ? quiz.solutionEntities.map(buildMtpMessageEntity) : [];

  return new GramJs.InputMediaPoll({
    poll,
    correctAnswers,
    solution,
    solutionEntities,
  });
}

export function generateRandomBigInt() {
  return readBigIntFromBuffer(generateRandomBytes(8), false);
}

export function reduceWaveform(waveform: number[]) {
  const reduced: number[] = new Array(WAVEFORM_LENGTH).fill(0);
  const precision = Math.ceil(waveform.length / WAVEFORM_LENGTH);
  let max = 0;

  for (let i = 0; i < WAVEFORM_LENGTH + 1; i++) {
    const part = waveform.slice(i * precision, (i + 1) * precision);
    if (!part.length) {
      break;
    }

    const sum = part.reduce((acc, spike) => acc + spike, 0);
    const value = sum / part.length;
    reduced[i] = value;
    if (value > max) {
      max = value;
    }
  }

  return reduced.map((v) => Math.round((v / max) * WAVEFORM_MAX_VALUE));
}

export function buildMessageFromUpdateShortSent(
  id: number,
  chatId: number,
  update: GramJs.UpdateShortSentMessage,
) {
  // This is not a proper message, but we only need these fields for downloading media through `localDb`.
  return new GramJs.Message({
    id,
    toId: buildPeer(chatId),
    fromId: chatId,
    media: update.media,
  } as GramJs.Message);
}

export function buildMtpMessageEntity(entity: ApiMessageEntity): GramJs.TypeMessageEntity {
  const {
    type, offset, length, url,
  } = entity;
  switch (type) {
    case ApiMessageEntityTypes.Bold:
      return new GramJs.MessageEntityBold({ offset, length });
    case ApiMessageEntityTypes.Italic:
      return new GramJs.MessageEntityItalic({ offset, length });
    case ApiMessageEntityTypes.Underline:
      return new GramJs.MessageEntityUnderline({ offset, length });
    case ApiMessageEntityTypes.Strike:
      return new GramJs.MessageEntityStrike({ offset, length });
    case ApiMessageEntityTypes.Code:
      return new GramJs.MessageEntityCode({ offset, length });
    case ApiMessageEntityTypes.Pre:
      return new GramJs.MessageEntityPre({ offset, length, language: '' });
    case ApiMessageEntityTypes.Blockquote:
      return new GramJs.MessageEntityBlockquote({ offset, length });
    case ApiMessageEntityTypes.TextUrl:
      return new GramJs.MessageEntityTextUrl({ offset, length, url: url! });
    case ApiMessageEntityTypes.Url:
      return new GramJs.MessageEntityUrl({ offset, length });
    case ApiMessageEntityTypes.Hashtag:
      return new GramJs.MessageEntityHashtag({ offset, length });
    default:
      return new GramJs.MessageEntityUnknown({ offset, length });
  }
}

// TODO: This formula is taken from API docs, but doesn't seem to calculate hash correctly
export function calculateResultHash(ids: number[]) {
  let hash = 0;
  ids.forEach((id) => {
    // eslint-disable-next-line no-bitwise
    hash = (((hash * 0x4F25) & 0x7FFFFFFF) + id) & 0x7FFFFFFF;
  });

  return hash;
}

export function isMessageWithMedia(message: GramJs.Message) {
  const { media } = message;

  if (!media) {
    return false;
  }

  return (
    media instanceof GramJs.MessageMediaPhoto
    || media instanceof GramJs.MessageMediaDocument
    || (
      media instanceof GramJs.MessageMediaWebPage
      && media.webpage instanceof GramJs.WebPage
      && media.webpage.photo instanceof GramJs.Photo
    )
  );
}

export function buildChatPhotoForLocalDb(photo: GramJs.TypePhoto) {
  if (photo instanceof GramJs.PhotoEmpty) {
    return new GramJs.ChatPhotoEmpty();
  }

  const { dcId } = photo;
  const nonStrippedSizes = photo.sizes
    .filter((s: any): s is (GramJs.PhotoSize | GramJs.PhotoCachedSize) => {
      return s instanceof GramJs.PhotoSize || s instanceof GramJs.PhotoCachedSize;
    });

  if (!nonStrippedSizes.length) {
    return new GramJs.ChatPhotoEmpty();
  }

  const smallSize = nonStrippedSizes.find((s) => s.type === 'a');
  const largeSize = nonStrippedSizes.find((s) => s.type === 'c') || nonStrippedSizes.find((s) => s.type === 'b');

  if (!smallSize || !largeSize) {
    return new GramJs.ChatPhotoEmpty();
  }

  return new GramJs.ChatPhoto({
    dcId,
    photoSmall: smallSize && smallSize.location,
    photoBig: largeSize && largeSize.location,
  });
}
