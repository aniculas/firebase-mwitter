"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";

interface ProfileEditorProps {
  userId: string;
}

const ProfileEditor = ({ userId }: ProfileEditorProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    handle: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            handle: userData.handle || "",
            email: userData.email || "",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateHandle = (handle: string) => {
    if (handle.length < 3) {
      return "Handle must be at least 3 characters long";
    }
    if (handle.length > 15) {
      return "Handle must be less than 15 characters long";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      return "Handle can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsUpdating(true);

    try {
      // Validate handle
      const handleError = validateHandle(formData.handle);
      if (handleError) {
        setError(handleError);
        setIsUpdating(false);
        return;
      }

      await runTransaction(db, async (transaction) => {
        // Get current user data
        const userDoc = await transaction.get(doc(db, "users", userId));
        const currentData = userDoc.data();

        // Check if handle is being changed
        if (currentData?.handle !== formData.handle.toLowerCase()) {
          // Check if new handle is available
          const handleDoc = await transaction.get(
            doc(db, "handles", formData.handle.toLowerCase()),
          );
          if (handleDoc.exists()) {
            throw new Error("This handle is already taken");
          }

          // Delete old handle document
          transaction.delete(doc(db, "handles", currentData?.handle));

          // Create new handle document
          transaction.set(doc(db, "handles", formData.handle.toLowerCase()), {
            userId: userId,
            createdAt: new Date().toISOString(),
          });
        }

        // Update user document
        transaction.update(doc(db, "users", userId), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          handle: formData.handle.toLowerCase(),
          displayName: `${formData.firstName} ${formData.lastName}`,
          updatedAt: new Date().toISOString(),
        });
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Handle Field */}
        <div>
          <label
            htmlFor="handle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">@</span>
            <input
              type="text"
              id="handle"
              name="handle"
              value={formData.handle}
              onChange={handleChange}
              className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileEditor;
