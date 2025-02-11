"use client";

import { useState, useEffect } from "react";
import Mweet from "./components/mweet";
import Post from "./components/post";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { followUser, unfollowUser, isFollowing } from "@/utils/followUtils";

interface Tweet {
  id: string;
  content: string;
  userHandle: string;
  userPhotoURL: string;
  userName: string;
  createdAt: Timestamp;
  userId: string;
}

type TimelineMode = "all" | "following";

export default function Home() {
  const [user] = useAuthState(auth);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [timelineMode, setTimelineMode] = useState<TimelineMode>("all");
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // Fetch following IDs
  useEffect(() => {
    if (!user) return;

    const fetchFollowingIds = async () => {
      const followsRef = collection(db, "follows");
      const q = query(followsRef, where("followerId", "==", user.uid));
      const snapshot = await getDocs(q);
      const ids = snapshot.docs.map((doc) => doc.data().followingId);
      setFollowingIds([user.uid, ...ids]); // Include user's own tweets
    };

    fetchFollowingIds();
  }, [user]);

  // Fetch tweets based on selected mode
  useEffect(() => {
    if (!user) return;

    let tweetsQuery;
    if (timelineMode === "following" && followingIds.length > 0) {
      tweetsQuery = query(
        collection(db, "tweets"),
        where("userId", "in", followingIds),
        orderBy("createdAt", "desc"),
      );
    } else {
      tweetsQuery = query(
        collection(db, "tweets"),
        orderBy("createdAt", "desc"),
      );
    }

    const unsubscribe = onSnapshot(
      tweetsQuery,
      (snapshot) => {
        const newTweets = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Tweet,
        );
        setTweets(newTweets);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tweets:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, timelineMode, followingIds]);

  // Load following status for each tweet author
  useEffect(() => {
    if (!user || tweets.length === 0) return;

    const loadFollowingStatus = async () => {
      const status: { [key: string]: boolean } = {};

      for (const tweet of tweets) {
        if (tweet.userId !== user.uid) {
          status[tweet.userId] = await isFollowing(user.uid, tweet.userId);
        }
      }

      setFollowingStatus(status);
    };

    loadFollowingStatus();
  }, [tweets, user]);

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) return;

    try {
      if (followingStatus[targetUserId]) {
        await unfollowUser(user.uid, targetUserId);
        setFollowingStatus((prev) => ({
          ...prev,
          [targetUserId]: false,
        }));
      } else {
        await followUser(user.uid, targetUserId);
        setFollowingStatus((prev) => ({
          ...prev,
          [targetUserId]: true,
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Failed to update following status. Please try again.");
    }
  };

  const formatTimestamp = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
      if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}m`;
      }
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h`;
    }

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}d`;
    }

    return date.toLocaleDateString();
  };

    return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
        </div>

        {/* Timeline Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-sm font-medium ${
              timelineMode === "all"
                ? "text-gray-900 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTimelineMode("all")}
          >
            All
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium ${
              timelineMode === "following"
                ? "text-gray-900 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTimelineMode("following")}
          >
            Following
          </button>
        </div>

        <div className="border-b border-gray-200">
          <Post userAvatar={user?.photoURL || "/api/placeholder/40/40"} />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="text-gray-500">Loading tweets...</div>
          </div>
        ) : tweets.length === 0 ? (
          <div className="flex justify-center p-4">
            <div className="text-gray-500">
              {timelineMode === "following"
                ? "No tweets from people you follow yet. Start following more people!"
                : "No tweets yet. Be the first to post!"}
            </div>
          </div>
        ) : (
          tweets.map((tweet) => (
            <Mweet
              key={tweet.id}
              username={tweet.userName}
              handle={`@${tweet.userHandle}`}
              avatarUrl={tweet.userPhotoURL}
              content={tweet.content}
              timestamp={formatTimestamp(tweet.createdAt)}
              isFollowing={followingStatus[tweet.userId] || false}
              onFollowToggle={() => handleFollowToggle(tweet.userId)}
              showFollowButton={tweet.userId !== user?.uid}
            />
          ))
        )}
      </div>
    </div>
  );
}