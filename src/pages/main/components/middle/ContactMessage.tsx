import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiUser, ApiContact } from '../../../../api/types';

import { selectUser } from '../../../../modules/selectors';
import { formatPhoneNumberWithCode } from '../../../../util/formatPhoneNumber';

import Avatar from '../../../../components/Avatar';

import './ContactMessage.scss';

type IProps = {
  contact: ApiContact;
  user: ApiUser;
};

const ContactMessage: FC<IProps> = ({ contact, user }) => {
  const {
    firstName,
    lastName,
    phoneNumber,
  } = contact;

  return (
    <div className="ContactMessage not-implemented">
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
)(ContactMessage);
