import React, {
  FC, useEffect, useRef, useState,
} from '../../lib/teact/teact';

import './AnimationFade.scss';
import usePrevious from '../../hooks/usePrevious';

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

  const isOpen = show;
  const prevIsOpen = usePrevious(isOpen);

  if (isOpen && !prevIsOpen) {
    console.log('transition start show');
    console.time('transition');
  } else if (!isOpen && prevIsOpen) {
    console.log('transition start hide');
    console.time('transition');
  }

  return (
    shouldRender && (
      <div
        className={`AnimationFade${show ? 'In' : 'Out'}`}
        onAnimationEnd={() => { console.timeEnd('transition'); onAnimationEnd(); }}
      >
        {children}
      </div>
    )
  );
};

export default AnimationFade;
