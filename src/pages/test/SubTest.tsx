import { FC, useState } from '../../lib/teact';
import React from '../../lib/teactn';
import { UpdateAuthorizationStateType } from '../../api/tdlib/updates';

type IProps = {
  authState?: UpdateAuthorizationStateType,
  rand: string,
};

const SubTest: FC<IProps> = ({ authState, rand }) => {
  console.log('rendering SUB TEST', authState, rand);
  const [value, setValue] = useState(0);

  return (
    <div>
      <div>
        THIS IS A SubTest PAGE
      </div>
      <div>
        authState: {authState}!
      </div>
      <div>
        rand: {rand}!
      </div>
      <div>
        state value: {value}!
        <input type="button" onClick={() => setValue(value + 1)} value=" + " />
      </div>
    </div>
  );
};

export default SubTest;
