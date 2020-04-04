import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiError } from '../../api/types';

import getReadableErrorText from '../../util/getReadableErrorText';

import Modal from './Modal';
import Button from './Button';

import './ErrorModalContainer.scss';

type StateProps = {
  errors: ApiError[];
};

type DispatchProps = Pick<GlobalActions, 'dismissError'>;

const ErrorModalContainer: FC<StateProps & DispatchProps> = ({ errors, dismissError }) => {
  if (!errors.length) {
    return null;
  }

  return (
    <div id="ErrorModalContainer">
      {errors.map((error) => (
        <Modal
          isOpen
          onClose={dismissError}
          className="error"
          title={getErrorHeader(error)}
        >
          <p>{getReadableErrorText(error)}</p>
          <Button isText onClick={dismissError}>OK</Button>
        </Modal>
      ))}
    </div>
  );
};

function getErrorHeader(error: ApiError) {
  if (error.message.startsWith('A wait of')) {
    return 'Slowmode enabled';
  }

  return 'Something went wrong';
}

export default withGlobal(
  (global): StateProps => {
    const { errors } = global;
    return { errors };
  },
  (setGlobal, actions): DispatchProps => {
    const { dismissError } = actions;
    return { dismissError };
  },
)(ErrorModalContainer);