"use client";

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import Navbar from "./components/navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import {
  collection,
  query,
  limit,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { followUser, isFollowing } from "@/utils/followUtils";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface FirestoreUser extends DocumentData {
  id: string;
  displayName: string;
  handle: string;
  photoURL: string;
  email: string;
}

interface SuggestedUser {
  id: string;
  displayName: string;
  handle: string;
  photoURL: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, loading, authError] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [hasAttemptedSuggestion, setHasAttemptedSuggestion] = useState(false);

  // Add debug logging for auth state
  useEffect(() => {
    console.log("Layout - Auth state:", { 
      loading, 
      user: user?.uid, 
      authError: authError ? authError.message : null,
      path: pathname
    });
  }, [loading, user, authError, pathname]);

  useEffect(() => {
    // Wait until auth is not loading before redirecting
    if (!loading && !user && pathname !== "/auth") {
      console.log("Layout - Redirecting to auth");
      router.push("/auth");
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user) return;

      setHasAttemptedSuggestion(true);
      console.log("Fetching suggested users");
      
      try {
        // Get all users
        const usersQuery = query(collection(db, "users"), limit(10));
        const snapshot = await getDocs(usersQuery);
        
        console.log(`Found ${snapshot.docs.length} user documents`);
        
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreUser[];

        // Filter out current user and users already being followed
        const filteredUsers = [];
        for (const potentialUser of users) {
          if (potentialUser.id !== user.uid) {
            try {
              const isAlreadyFollowing = await isFollowing(
                user.uid,
                potentialUser.id,
              );
              if (!isAlreadyFollowing) {
                filteredUsers.push({
                  id: potentialUser.id,
                  displayName: potentialUser.displayName || "Anonymous",
                  handle: potentialUser.handle,
                  photoURL: potentialUser.photoURL || "/api/placeholder/40/40",
                });
              }
            } catch (error) {
              console.error("Error checking follow status:", error);
            }
          }
        }

        console.log(`Filtered to ${filteredUsers.length} suggested users`);
        setSuggestedUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    // Only fetch suggested users if we have a user and haven't already tried
    if (user && !hasAttemptedSuggestion) {
      fetchSuggestedUsers();
    } else if (!user) {
      // Reset state when user is not logged in
      setLoadingUsers(false);
      setHasAttemptedSuggestion(false);
    }
  }, [user, hasAttemptedSuggestion]);

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      await followUser(user.uid, userId);
      // Remove user from suggestions after following
      setSuggestedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Don't show the layout on the auth page
  if (pathname === "/auth") {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen h-screen overflow-hidden">
          <Navbar />
          <main className="flex-1 border-l border-r border-gray-200 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : (
              children
            )}
          </main>
          {user && (
            <div className="w-64 h-screen bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
              <div className="sticky top-4">
                <h2 className="text-xl font-bold mb-4">Who to Follow</h2>
                {loadingUsers ? (
                  <div className="text-gray-500">Loading suggestions...</div>
                ) : suggestedUsers.length === 0 ? (
                  <div className="text-gray-500">No suggestions available</div>
                ) : (
                  <div className="space-y-4">
                    {suggestedUsers.map((suggestedUser) => (
                      <div
                        key={suggestedUser.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                            <Image
                              src={"/64px-Default_pfp.svg.png"}
                              alt={`${suggestedUser.displayName}'s profile picture`}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-gray-900">
                              {suggestedUser.displayName}
                            </span>
                            <span className="text-xs text-gray-500">
                              @{suggestedUser.handle}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFollow(suggestedUser.id)}
                          className="text-sm px-3 py-1 bg-gray-900 text-white rounded-full hover:bg-gray-700"
                        >
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}