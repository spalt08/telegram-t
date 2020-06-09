import React, {
  FC, memo, useCallback, useEffect,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiSticker, ApiStickerSet } from '../../../api/types';
import { GlobalActions } from '../../../global/types';

import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Loading from '../../ui/Loading';
import StickerButton from '../../common/StickerButton';

import './StickerSetModal.scss';
import { pick } from '../../../util/iteratees';
import { selectStickerSet } from '../../../modules/selectors';

export type OwnProps = {
  isOpen: boolean;
  fromSticker: ApiSticker;
  onClose: () => void;
};

type StateProps = {
  stickerSet?: ApiStickerSet;
};

type DispatchProps = Pick<GlobalActions, 'loadStickers' | 'toggleStickerSet' | 'sendMessage'>;

const StickerSetModal: FC<OwnProps & StateProps & DispatchProps> = ({
  isOpen,
  fromSticker,
  stickerSet,
  onClose,
  loadStickers,
  toggleStickerSet,
  sendMessage,
}) => {
  useEffect(() => {
    if (isOpen) {
      const { stickerSetId, stickerSetAccessHash } = fromSticker;
      loadStickers({ stickerSetId, stickerSetAccessHash });
    }
  }, [isOpen, fromSticker, loadStickers]);

  const handleSelect = useCallback((sticker: ApiSticker) => {
    sendMessage({ sticker });
    onClose();
  }, [onClose, sendMessage]);

  const handleButtonClick = useCallback(() => {
    toggleStickerSet({ stickerSetId: fromSticker.stickerSetId });
    onClose();
  }, [fromSticker.stickerSetId, onClose, toggleStickerSet]);

  return (
    <Modal
      className="StickerSetModal"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      title={stickerSet ? stickerSet.title : 'Sticker Set'}
    >
      {stickerSet && stickerSet.stickers ? (
        <>
          <div className="stickers custom-scroll">
            {stickerSet.stickers.map((sticker) => <StickerButton sticker={sticker} load onClick={handleSelect} />)}
          </div>
          <div className="button-wrapper">
            <Button
              size="smaller"
              fluid
              color={stickerSet.installedDate ? 'danger' : 'primary'}
              onClick={handleButtonClick}
            >
              {`${stickerSet.installedDate ? 'Remove' : 'Add'} ${stickerSet.count} stickers`}
            </Button>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </Modal>
  );
};

export default memo(withGlobal(
  (global, { fromSticker }: OwnProps) => {
    return { stickerSet: selectStickerSet(global, fromSticker.stickerSetId) };
  },
  (setGlobal, actions): DispatchProps => pick(actions, [
    'loadStickers',
    'toggleStickerSet',
    'sendMessage',
  ]),
)(StickerSetModal));
