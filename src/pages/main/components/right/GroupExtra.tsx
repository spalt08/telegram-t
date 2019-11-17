import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { ApiGroup } from '../../../../api/tdlib/types';
import { selectChat, selectChatGroupId, selectGroup } from '../../../../modules/selectors';
import { getGroupDescription, getGroupLink } from '../../../../modules/helpers';

type IProps = {
  chatId: number;
  group: ApiGroup;
};

const GroupChatInfo: FC<IProps> = ({
  group,
}) => {
  const description = (group && getGroupDescription(group)) || '';
  const link = (group && getGroupLink(group)) || '';
  const url = link.indexOf('http') === 0 ? link : `http://${link}`;

  return (
    <div className="ChatExtra">
      {description && !!description.length && (
        <div className="item">
          <i className="icon-info" />
          <div>
            <p className="title">{description}</p>
            <p className="subtitle">About</p>
          </div>
        </div>
      )}
      {!!link.length && (
        <div className="item">
          <i className="icon-username" />
          <div>
            <a className="title" href={url}>{link}</a>
            <p className="subtitle">Link</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default withGlobal(
  (global, { chatId }: IProps) => {
    const chat = selectChat(global, chatId);
    const chatGroupId = chat && selectChatGroupId(chat);
    const group = chatGroupId && selectGroup(global, chatGroupId);

    return { group };
  },
)(GroupChatInfo);
