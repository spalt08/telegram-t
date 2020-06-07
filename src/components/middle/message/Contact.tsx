import React, { FC } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiUser, ApiContact } from '../../../api/types';

import { selectUser } from '../../../modules/selectors';
import { formatPhoneNumberWithCode } from '../../../util/phoneNumber';

import Avatar from '../../common/Avatar';

import './Contact.scss';

type OwnProps = {
  contact: ApiContact;
};

type StateProps = {
  user?: ApiUser;
};

const Contact: FC<OwnProps & StateProps> = ({ contact, user }) => {
  const {
    firstName,
    lastName,
    phoneNumber,
  } = contact;

  return (
    <div className="Contact not-implemented">
      <Avatar size="large" user={user} />
      <div className="contact-info">
        <div className="contact-name">{firstName} {lastName}</div>
        <div className="contact-phone">{formatPhoneNumberWithCode(phoneNumber)}</div>
      </div>
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global, { contact }): StateProps => {
    return {
      user: selectUser(global, contact.userId),
    };
  },
)(Contact);
