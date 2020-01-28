import React, { FC } from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { ApiUser, ApiContact } from '../../../api/types';

import { selectUser } from '../../../modules/selectors';
import { formatPhoneNumberWithCode } from '../../../util/phoneNumber';

import Avatar from '../../common/Avatar';

import './Contact.scss';

type IProps = {
  contact: ApiContact;
  user: ApiUser;
};

const Contact: FC<IProps> = ({ contact, user }) => {
  const {
    firstName,
    lastName,
    phoneNumber,
  } = contact;

  return (
    <div className="Contact not-implemented">
      <Avatar size="large" user={user} />
      <div className="contact-info">
        <div className="contact-name">{`${firstName} ${lastName}`}</div>
        <div className="contact-phone">{formatPhoneNumberWithCode(phoneNumber)}</div>
      </div>
    </div>
  );
};

export default withGlobal(
  (global, { contact }: IProps) => {
    return {
      user: selectUser(global, contact.userId),
    };
  },
)(Contact);
