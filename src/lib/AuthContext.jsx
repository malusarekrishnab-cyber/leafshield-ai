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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Profile (role, extra data) fetch ani sync logic
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userSnap.data() });
          } else {
            // Jar navin user Google ne aala asel tar tyacha profile database मध्ये banva
            await setDoc(userDocRef, {
              role: "user",
              email: firebaseUser.email,
            });
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "user" });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Background profile fetch/sync failed:", err);
        // Error aala tari offline purta basic data set theva
        if (firebaseUser) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "user" });
        } else {
          setUser(null);
        }
      } finally {
        // ⚠️ हे अत्यंत महत्वाचं आहे: काहीही झालं तरी लोडिंग थांबलीच पाहिजे!
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Email Password Login with Proper Error Handling ---
  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Successful");
      return cred.user;
    } catch (error) {
      const errorCode = error.code;

      if (errorCode === 'auth/wrong-password') {
        alert("Incorrect password. Krupaya parat try kar.");
      } else if (errorCode === 'auth/user-not-found') {
        alert("Email not registered. Aadhi account create kar.");
      } else if (errorCode === 'auth/invalid-credential') {
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

  // --- Google Login with Redirect ---
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