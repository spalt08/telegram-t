import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';
import { GlobalState } from '../../global/types';

import Spinner from '../ui/Spinner';

import './ConnectionState.scss';

type StateProps = Pick<GlobalState, 'connectionState'>;

const ConnectionState: FC<StateProps> = ({ connectionState }) => {
  const isConnecting = connectionState === 'connectionStateConnecting';
  return isConnecting && (
    <div id="ConnectionState">
      <Spinner color="black" />
      <div className="state-text">Waiting for network...</div>
    </div>
  );
};

export default withGlobal(
  (global): StateProps => {
    const { connectionState } = global;
    return { connectionState };
  },
)(ConnectionState);
