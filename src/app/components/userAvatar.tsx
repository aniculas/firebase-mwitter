// components/UserAvatar.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface UserAvatarProps {
  src: string;
  alt: string;
  size?: number;
}

const UserAvatar = ({ src, alt, size = 40 }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-full bg-gray-100`} 
         style={{ width: size, height: size }}>
      <Image
        src={'/64px-Default_pfp.svg.png'}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImgError(true)}
        priority
      />
    </div>
  );
};

export default UserAvatar;