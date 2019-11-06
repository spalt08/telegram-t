import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import InputText from '../../../../components/ui/InputText';

import './MiddleFooter.scss';

const MiddleFooter: FC = ({}) => {
  return (
    <div className="MiddleFooter">{
      <InputText placeholder="Message" onChange={onInputChange} />
    }</div>
  );
};

function onInputChange() {

}

export default withGlobal(

)(MiddleFooter);
