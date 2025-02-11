'use client';

import Image from 'next/image';
import FollowButton from './followButton';

interface ProfileCardProps {
  username: string;
  handle: string;
  avatarUrl: string;
  isFollowing: boolean;
  onFollowToggle: () => void;
}

const ProfileCard = ({
  username,
  handle,
  avatarUrl,
  isFollowing,
  onFollowToggle
}: ProfileCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
          <Image
            src={"/64px-Default_pfp.svg.png"}
            alt={`${username}'s profile picture`}
            width={48}
            height={48}
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{username}</span>
          <span className="text-gray-500 text-sm">{handle}</span>
        </div>
      </div>
      
      <FollowButton 
        isFollowing={isFollowing} 
        onFollowToggle={onFollowToggle}
      />
    </div>
  );
};

export default ProfileCard;