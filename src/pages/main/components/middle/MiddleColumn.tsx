import React, { FC } from '../../../../lib/reactt';
import { GlobalState, withGlobal } from '../../../../lib/reactnt';

type IProps = Partial<GlobalState>

const MiddleColumn: FC<IProps> = () => {
  return (
    <div>
      Middle Column
    </div>
  )
};

export default withGlobal(
)(MiddleColumn);
