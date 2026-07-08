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
      if (firebaseUser) {
        // Lagach basic user state set kar (fast UI sathi)
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "user" });
        setIsLoadingAuth(false);

        // Profile (role, extra data) fetch ani sync logic
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
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
        } catch (err) {
          console.error("Background profile fetch/sync failed:", err);
        }
      } else {
        setUser(null);
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
        // Navin Firebase protection mule ha error disto (wrong email kiva password sathi)
        alert("Incorrect email or password. Krupaya details check kar.");
      } else {
        alert("Something went wrong. Thodya velane try kar.");
        console.error("Firebase Auth Error:", error.message);
      }
      throw error; // Ha error pudhe pass kela jya mule UI madhe loading state thambavta yeil
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
    // Redirect direct page dusrikade ghetto, mhanun ithe variable madhe data store hot nahi.
    // Profile handling aapan varती useEffect madhe automatic keleli ahe.
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