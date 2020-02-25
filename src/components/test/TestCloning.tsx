import React, { useRef } from '../../lib/teact/teact';

const MyComponentA = () => {
  const ref = useRef(Math.random());

  return String(ref.current);
};

const MyComponentB = () => {
  const b = <MyComponentA />;

  return (
    <div>
      {b}
      <br />
      {b}
      <br />
      {b}
    </div>
  );
};

export default MyComponentB;
