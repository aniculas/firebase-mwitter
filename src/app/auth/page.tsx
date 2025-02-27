"use client";

import { useState, useEffect } from "react";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
  useAuthState,
} from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, runTransaction } from "firebase/firestore";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handleError, setHandleError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [user] = useAuthState(auth);

  const [createUserWithEmailAndPassword, , signupLoading, signupError] =
    useCreateUserWithEmailAndPassword(auth);

  const [signInWithEmailAndPassword, , loginLoading, loginError] =
    useSignInWithEmailAndPassword(auth);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Check if handle exists
  const checkHandleAvailability = async (handle: string) => {
    try {
      console.log("Checking handle:", handle.toLowerCase());
      const handleRef = doc(db, "handles", handle.toLowerCase());
      const handleDoc = await getDoc(handleRef);
      console.log("Handle document exists?", handleDoc.exists());
      console.log("Handle document data:", handleDoc.data());
      return !handleDoc.exists();
    } catch (error) {
      console.error("Error checking handle:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      await signInWithEmailAndPassword(email, password);
    } else {
      // Validate all required fields
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !handle.trim() ||
        !password
      ) {
        alert("Please fill in all required fields");
        return;
      }

      console.log("Starting signup process with:", {
        firstName,
        lastName,
        email,
        handle,
      });

      // Validate handle first
      const validationError = validateHandle(handle);
      if (validationError) {
        setHandleError(validationError);
        return;
      }

      // Check handle availability
      const isHandleAvailable = await checkHandleAvailability(handle);
      if (!isHandleAvailable) {
        setHandleError("This handle is already taken");
        return;
      }

      try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(
          email,
          password,
        );

        if (userCredential) {
          const userId = userCredential.user.uid;
          console.log("Created auth user with ID:", userId);

          try {
            // Use a transaction to ensure atomic operations
            await runTransaction(db, async (transaction) => {
              const handleDoc = await transaction.get(
                doc(db, "handles", handle.toLowerCase()),
              );

              if (handleDoc.exists()) {
                throw new Error("Handle was taken during signup process");
              }

              const userData = {
                email,
                handle: handle.toLowerCase(),
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`,
                bio: "",
                photoURL: "/default-profile.jpg", 
                followers: 0,
                following: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isVerified: false,
                lastSeen: new Date().toISOString(),
              };

              console.log("Creating user document with data:", userData);

              // Create user document
              transaction.set(doc(db, "users", userId), userData);

              // Reserve handle
              transaction.set(doc(db, "handles", handle.toLowerCase()), {
                userId: userId,
                createdAt: new Date().toISOString(),
              });
            });

            console.log("Successfully created user documents");
          } catch (error) {
            console.error("Error creating user documents:", error);
            throw new Error("Failed to create user profile");
          }
        }
      } catch (error) {
        console.error("Signup error:", error);
        alert("Error during signup: " + (error as Error).message);
      }
    }
  };

  // Handle validation function
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="sr-only">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="handle" className="sr-only">
                    Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      @
                    </span>
                    <input
                      id="handle"
                      name="handle"
                      type="text"
                      required
                      className="appearance-none rounded relative block w-full px-8 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="handle"
                      value={handle}
                      onChange={(e) => {
                        setHandle(e.target.value);
                        setHandleError("");
                      }}
                    />
                  </div>
                  {handleError && (
                    <p className="text-red-500 text-sm mt-1">{handleError}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {(loginError || signupError) && (
            <div className="text-red-500 text-sm">
              {loginError?.message || signupError?.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loginLoading || signupLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loginLoading || signupLoading
                ? "Loading..."
                : isLogin
                  ? "Sign in"
                  : "Sign up"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setHandleError("");
              setHandle("");
              setFirstName("");
              setLastName("");
            }}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
