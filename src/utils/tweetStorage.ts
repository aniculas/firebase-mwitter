import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

interface TweetData {
  content: string;
  userHandle: string;
  userPhotoURL: string;
  userId: string;
  userName: string;
}

export const createTweet = async (tweetData: TweetData) => {
  try {
    const tweetsCollection = collection(db, "tweets");

    const newTweet = {
      ...tweetData,
      createdAt: serverTimestamp(),
      likes: 0,
      retweets: 0,
    };

    const docRef = await addDoc(tweetsCollection, newTweet);
    return docRef.id;
  } catch (error) {
    console.error("Error creating tweet:", error);
    throw error;
  }
};

export const getRecentTweets = async () => {
  try {
    const tweetsCollection = collection(db, "tweets");
    const q = query(tweetsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
};
