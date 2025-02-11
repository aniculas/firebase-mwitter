// utils/followUtils.ts
import { db } from '@/firebase';
import { 
  doc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  writeBatch
} from 'firebase/firestore';

// Follow a user
export const followUser = async (followerId: string, targetUserId: string) => {
  // Prevent self-following
  if (followerId === targetUserId) {
    throw new Error('Cannot follow yourself');
  }

  try {
    const batch = writeBatch(db);

    // Create unique follow document ID
    const followDoc = doc(collection(db, 'follows'));
    
    // Add follow document
    batch.set(followDoc, {
      followerId,
      followingId: targetUserId,
      createdAt: new Date().toISOString()
    });

    // Update follower count for target user
    const targetUserRef = doc(db, 'users', targetUserId);
    batch.update(targetUserRef, {
      followers: increment(1)
    });

    // Update following count for current user
    const currentUserRef = doc(db, 'users', followerId);
    batch.update(currentUserRef, {
      following: increment(1)
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (followerId: string, targetUserId: string) => {
  try {
    // Find the follow document
    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef, 
      where('followerId', '==', followerId),
      where('followingId', '==', targetUserId)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('Not following this user');
    }

    const batch = writeBatch(db);

    // Delete the follow document
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Update follower count for target user
    const targetUserRef = doc(db, 'users', targetUserId);
    batch.update(targetUserRef, {
      followers: increment(-1)
    });

    // Update following count for current user
    const currentUserRef = doc(db, 'users', followerId);
    batch.update(currentUserRef, {
      following: increment(-1)
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Check if user is following another user
export const isFollowing = async (followerId: string, targetUserId: string) => {
  try {
    const followsRef = collection(db, 'follows');
    const q = query(
      followsRef,
      where('followerId', '==', followerId),
      where('followingId', '==', targetUserId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

// Get all users that a user is following
export const getFollowing = async (userId: string) => {
  try {
    const followsQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    
    const querySnapshot = await getDocs(followsQuery);
    const followingIds = querySnapshot.docs.map(doc => doc.data().followingId);
    
    // Get user details for each following
    const followingUsers = await Promise.all(
      followingIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      })
    );
    
    return followingUsers;
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

// Get all users following a user
export const getFollowers = async (userId: string) => {
  try {
    const followsQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );
    
    const querySnapshot = await getDocs(followsQuery);
    const followerIds = querySnapshot.docs.map(doc => doc.data().followerId);
    
    // Get user details for each follower
    const followers = await Promise.all(
      followerIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      })
    );
    
    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};