import React, { FC } from '../../lib/teact/teact';

import './Tab.scss';

type IProps = {
  id: number;
  title: string;
  active?: boolean;
  onClick: (id: number) => void;
};

const Tab: FC<IProps> = ({
  id, title, active, onClick,
}) => {
  const handleClick = () => {
    onClick(id);
  };

  return (
    <button
      type="button"
      className={`Tab ${active ? 'active' : ''}`}
      onClick={handleClick}
    >
      {title}
    </button>
  );
};

export default Tab;
