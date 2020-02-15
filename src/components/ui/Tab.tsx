import React, { FC } from '../../lib/teact/teact';

import './Tab.scss';

type IProps = {
  id: number;
  title: string;
  className?: string;
  active?: boolean;
  onClick?: (id: number) => void;
};

const Tab: FC<IProps> = ({
  id, title, className, active, onClick,
}) => {
  const handleClick = onClick && (() => onClick(id));

  return (
    <button
      type="button"
      className={`Tab ${active ? 'active' : ''} ${className || ''}`}
      onClick={handleClick}
    >
      {title}
    </button>
  );
};

export default Tab;
