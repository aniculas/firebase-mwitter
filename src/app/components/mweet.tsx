"use client";

import FollowButton from "./followButton";
import UserAvatar from "./userAvatar";

interface MweetProps {
  username: string;
  handle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  isFollowing: boolean;
  onFollowToggle: () => void;
  showFollowButton?: boolean;
}

const Mweet = ({
  username,
  handle,
  avatarUrl,
  content,
  timestamp,
  isFollowing,
  onFollowToggle,
  showFollowButton = true,
}: MweetProps) => {
  return (
    <div className="p-4 hover:bg-gray-50 border-t border-gray-100">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
            <UserAvatar
              src={avatarUrl}
              alt={`${username}'s profile picture`}
              size={40}
            />
          </div>
        </div>

        {/* Tweet Content */}
        <div className="flex-1">
          {/* Tweet Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900">{username}</span>
              <span className="text-gray-500">{handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{timestamp}</span>
            </div>

            {showFollowButton && (
              <FollowButton
                isFollowing={isFollowing}
                onFollowToggle={onFollowToggle}
              />
            )}
          </div>

          {/* Tweet Body */}
          <div className="mt-1 text-gray-900">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default Mweet;
