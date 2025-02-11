"use client";

import { useState, useEffect } from "react";
import ProfileCard from "../components/profileCard";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { getFollowing, unfollowUser } from "@/utils/followUtils";

interface FollowedUser {
  id: string;
  displayName: string;
  handle: string;
  photoURL: string;
}

export default function Following() {
  const [user] = useAuthState(auth);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFollowedUsers = async () => {
      if (!user) return;

      try {
        const users = await getFollowing(user.uid);
        setFollowedUsers(
          users.map((user) => ({
            id: user.id,
            displayName: user.displayName || "Anonymous",
            handle: user.handle,
            photoURL: user.photoURL || "/api/placeholder/40/40",
          })),
        );
      } catch (error) {
        console.error("Error loading followed users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFollowedUsers();
  }, [user]);

  const handleUnfollow = async (targetUserId: string) => {
    if (!user) return;

    try {
      await unfollowUser(user.uid, targetUserId);
      // Remove user from the list
      setFollowedUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("Failed to unfollow user. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Following</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Following</h1>
        </div>
      </div>

      <div className="p-4">
        {followedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You aren&apos;t following anyone yet
          </div>
        ) : (
          <div className="space-y-2">
            {followedUsers.map((followedUser) => (
              <ProfileCard
                key={followedUser.id}
                username={followedUser.displayName}
                handle={`@${followedUser.handle}`}
                avatarUrl={followedUser.photoURL}
                isFollowing={true}
                onFollowToggle={() => handleUnfollow(followedUser.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
