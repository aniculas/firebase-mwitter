'use client';

import React, { useState } from 'react';

interface FollowButtonProps {
  isFollowing: boolean;
  onFollowToggle: () => void;
}

const FollowButton = ({ isFollowing, onFollowToggle }: FollowButtonProps) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <button
      onClick={onFollowToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`w-24 px-4 py-1 rounded-full text-sm font-medium transition-colors border ${
        isFollowing
          ? isHovering
            ? 'bg-red-100 text-red-600 border-red-200'
            : 'bg-white text-gray-700 border-gray-300'
          : 'bg-blue-500 text-white border-transparent hover:bg-blue-900'
      }`}
    >
      {isFollowing 
        ? (isHovering ? 'Unfollow' : 'Following')
        : 'Follow'
      }
    </button>
  );
};

export default FollowButton;