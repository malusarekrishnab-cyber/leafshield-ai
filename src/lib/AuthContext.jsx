import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup, 
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
        // १. फास्ट लोडिंग: युझरचा बेसिक डेटा, नाव आणि फोटो लगेच सेट कर
        setUser({ 
          uid: firebaseUser.uid, 
          email: firebaseUser.email, 
          name: firebaseUser.displayName || "शेतकरी",
          photoURL: firebaseUser.photoURL,
          role: "user" 
        });
        setIsLoadingAuth(false); 

        // २. बॅकग्राउंड डेटा फेच: आता शांतपणे फायरस्टोर मधून डेटा घे.
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUser((prev) => ({ ...prev, ...userSnap.data() }));
          } else {
            // नवीन Google युझर असेल तर त्याचा डेटा सेव्ह कर
            await setDoc(userDocRef, { role: "user", email: firebaseUser.email });
          }
        } catch (err) {
          console.error("Background profile fetch failed:", err);
        }
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
      return cred.user;
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/wrong-password") {
        alert("Incorrect password. कृपया परत ट्राय कर.");
      } else if (errorCode === "auth/user-not-found") {
        alert("Email not registered. आधी अकाउंट क्रिएट कर.");
      } else if (errorCode === "auth/invalid-credential") {
        alert("Incorrect email or password. कृपया डिटेल्स चेक कर.");
      } else {
        alert("Something went wrong. थोड्या वेळाने ट्राय कर.");
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Blocked or Failed:", error);
      alert("Google Login कॅन्सल झाला किंवा फेल झाला.");
    }
  };

  const logout = async () => {
    sessionStorage.removeItem("leafshield_chat_history");
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