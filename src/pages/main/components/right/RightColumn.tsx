import React, { FC } from '../../../../lib/reactt';
import { GlobalState, withGlobal } from '../../../../lib/reactnt';

type IProps = Partial<GlobalState>

const RightColumn: FC<IProps> = () => {
  return (
    <div>
      Right Column
    </div>
  )
};

export default withGlobal(
)(RightColumn);
