"use client";

import Image from "next/image";

interface UserAvatarProps {
  alt: string;
  size?: number;
}

const UserAvatar = ({ alt, size = 40 }: UserAvatarProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-full bg-gray-100"
      style={{ width: size, height: size }}
    >
      <Image
        src="/64px-Default_pfp.svg.png"
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        priority
      />
    </div>
  );
};

export default UserAvatar;