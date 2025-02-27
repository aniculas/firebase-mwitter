"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Smile, LogOut, LucideIcon } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

interface NavigationItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface UserData {
  displayName: string;
  handle: string;
  photoURL: string;
  email: string;
}

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, loading, authError] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fetchingUserData, setFetchingUserData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation: NavigationItem[] = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Following", icon: Users, path: "/following" },
    { name: "Your Profile", icon: Smile, path: "/profile" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      console.log("No user found, redirecting to auth");
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log("No user to fetch data for");
        setFetchingUserData(false);
        return;
      }
      
      console.log("Fetching user data for:", user.uid);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          console.log("User document found");
          setUserData({
            displayName: userDoc.data().displayName || "User",
            handle: userDoc.data().handle || "",
            photoURL: userDoc.data().photoURL || "/api/placeholder/40/40",
            email: userDoc.data().email || user.email || "",
          });
        } else {
          console.log("User document does not exist");
          setError("User document not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(`Error fetching user data: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setFetchingUserData(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Debug logging for auth state
  useEffect(() => {
    console.log("Auth state:", { loading, user: user?.uid, authError });
  }, [loading, user, authError]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || fetchingUserData) {
    return (
      <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <p className="text-xl font-bold text-blue-500">mwitter</p>
          <p className="text-sm mt-2">Loading...</p>
          <p className="text-xs text-gray-500 mt-1">
            Auth state: {loading ? "Loading" : user ? "Signed in" : "Signed out"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <p className="text-xl font-bold text-blue-500">mwitter</p>
          <p className="text-sm text-red-500 mt-2">Error: {error}</p>
        </div>
        <button
          className="m-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/auth")}
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <p className="text-xl font-bold text-blue-500">mwitter</p>
          <p className="text-sm mt-2">Please sign in</p>
        </div>
        <button
          className="m-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/auth")}
        >
          Sign In
        </button>
      </div>
    );
  }

  // Fall back to using just auth user data if Firestore data is missing
  if (!userData) {
    return (
      <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold text-blue-500">mwitter</h1>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg ${
                    pathname === item.path ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/64px-Default_pfp.svg.png"
                alt="Profile"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-500">User data pending...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold text-blue-500">mwitter</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg ${
                  pathname === item.path ? "bg-gray-200" : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <button
        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span>Log out</span>
      </button>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src="/64px-Default_pfp.svg.png"
              alt="Profile"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1">
            <p className="font-medium text-gray-900">{userData.displayName}</p>
            <p className="text-sm text-gray-500">@{userData.handle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;