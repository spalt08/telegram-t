import React, {
  FC, useEffect, useState,
} from '../../lib/teact/teact';

import './AnimationFade.scss';

interface IProps {
  show: boolean;
  children: any;
}

const AnimationFade: FC<IProps> = ({ show, children }) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    }
  }, [show]);

  const onAnimationEnd = () => {
    if (!show) {
      setShouldRender(false);
    }
  };

  return (
    shouldRender && (
      <div
        className={`AnimationFade${show ? 'In' : 'Out'}`}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    )
  );
};

export default AnimationFade;
