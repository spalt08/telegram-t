import React, { FC } from '../../lib/teact/teact';

import useShowTransition from '../../hooks/useShowTransition';
import buildClassName from '../../util/buildClassName';

import './AttentionIndicator.scss';

interface OwnProps {
  show: boolean;
}

const AttentionIndicator: FC<OwnProps> = ({ show }) => {
  const { shouldRender, transitionClassNames } = useShowTransition(show, undefined, undefined, false);

  if (!shouldRender) {
    return undefined;
  }

  const className = buildClassName(
    'AttentionIndicator',
    transitionClassNames,
  );

  return (
    <div className={className} />
  );
};

export default AttentionIndicator;
