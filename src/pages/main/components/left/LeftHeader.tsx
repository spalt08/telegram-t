import React, { FC } from '../../../../lib/teact';

import DropdownMenu from '../../../../components/ui/DropdownMenu';
import DropdownMenuItem from '../../../../components/ui/DropdownMenuItem';
import SearchInput from './SearchInput';

import './LeftHeader.scss';

const LeftHeader: FC = () => {
  return (
    <div id="LeftHeader">
      <DropdownMenu
        size="smaller"
        color="translucent"
        icon="menu"
      >
        {/* TODO @not-implemented */}
        <DropdownMenuItem icon="new-group" onClick={() => {}}>New Group</DropdownMenuItem>
        <DropdownMenuItem icon="user" onClick={() => {}}>Contacts</DropdownMenuItem>
        <DropdownMenuItem icon="archive" onClick={() => {}}>Archived</DropdownMenuItem>
        <DropdownMenuItem icon="saved-messages" onClick={() => {}}>Saved</DropdownMenuItem>
        <DropdownMenuItem icon="settings" onClick={() => {}}>Settings</DropdownMenuItem>
        <DropdownMenuItem icon="help" onClick={() => {}}>Help</DropdownMenuItem>
        {/* TODO @mockup */}
        <DropdownMenuItem icon="close" onClick={() => {}}>Logout</DropdownMenuItem>
      </DropdownMenu>
      <SearchInput />
    </div>
  );
};

export default LeftHeader;
