export interface ApiGroupMember {
  '@type': 'chatMember';
  inviter_user_id: number;
  joined_chat_date: number;
  user_id: number;
}

export interface ApiGroup {
  id: number;
  '@type': 'basicGroup' | 'supergroup';
  is_active: boolean;
  member_count: number;

  // Only for supergroups
  is_channel?: boolean;
  is_verified?: true;
  administrator_count?: number;
  username?: string;

  // Data from *groupFullInfo
  description?: string;
  invite_link?: string;
  creator_user_id?: number;
  members?: ApiGroupMember[];
}
