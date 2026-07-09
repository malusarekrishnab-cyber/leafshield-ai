import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "user" });
        setIsLoadingAuth(false);

        const userDocRef = doc(db, "users", firebaseUser.uid);
        getDoc(userDocRef)
          .then(async (userSnap) => {
            if (userSnap.exists()) {
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userSnap.data() });
            } else {
              await setDoc(userDocRef, { role: "user", email: firebaseUser.email });
            }
          })
          .catch((err) => {
            console.error("Background profile fetch/sync failed:", err);
          });
      } else {
        setUser(null);
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Successful");
      return cred.user;
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/wrong-password") {
        alert("Incorrect password. Krupaya parat try kar.");
      } else if (errorCode === "auth/user-not-found") {
        alert("Email not registered. Aadhi account create kar.");
      } else if (errorCode === "auth/invalid-credential") {
        alert("Incorrect email or password. Krupaya details check kar.");
      } else {
        alert("Something went wrong. Thodya velane try kar.");
        console.error("Firebase Auth Error:", error.message);
      }
      throw error;
    }
  };

  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        role: "user",
        email,
      });
    } catch (err) {
      console.error("Failed to create user profile:", err);
    }
    return cred.user;
  };

  const loginWithGoogle = async () => {
    await signInWithRedirect(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    isLoadingAuth,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}