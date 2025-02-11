'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import ProfileEditor from "../components/profileEditor";

export default function Profile() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        </div>
      </div>

      <div className="p-4">
        <ProfileEditor userId={user.uid} />
      </div>
    </div>
  );
}