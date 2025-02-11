'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { createTweet } from '@/utils/tweetStorage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface PostProps {
  userAvatar: string;
}

const MAX_CHARS = 280;

const Post = ({ }: PostProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user] = useAuthState(auth);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARS) {
      setContent(newContent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User data not found');
      }

      // Create the tweet
      await createTweet({
        content: content.trim(),
        userHandle: userData.handle,
        userPhotoURL: userData.photoURL || '/default-profile.jpg',
        userId: user.uid,
        userName: userData.displayName || 'Anonymous',
      });

      // Clear the input
      setContent('');
    } catch (error) {
      console.error('Error posting tweet:', error);
      alert('Failed to post tweet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charsRemaining = MAX_CHARS - content.length;
  const progress = (content.length / MAX_CHARS) * 100;
  
  const getProgressColor = () => {
    if (charsRemaining <= 30) return 'bg-red-500';
    if (charsRemaining <= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={'/64px-Default_pfp.svg.png'}
                alt="Your profile picture"
                width={40}
                height={40}
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={handleChange}
              placeholder="What's on your mind..."
              className="w-full resize-none rounded-lg p-2 text-gray-900 placeholder-gray-500 focus:ring-0 focus:outline-none"
              rows={4}
            />
            
            {/* Character Count and Submit Button */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {content.length > 0 && (
                  <>
                    <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${getProgressColor()}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {charsRemaining <= 80 && (
                      <span className={`text-sm ${
                        charsRemaining <= 30 
                          ? 'text-red-500' 
                          : charsRemaining <= 80 
                            ? 'text-yellow-500' 
                            : 'text-gray-500'
                      }`}>
                        {charsRemaining}
                      </span>
                    )}
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Post;