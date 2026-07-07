// src/pages/Profile.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Camera, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "firebase/auth";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName });
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const avatar = user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-3xl font-bold border-2 border-white/30">
              {avatar}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.displayName || "User"}</h1>
              <p className="text-green-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {message && (
            <div className={`p-3 rounded-xl text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Display Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-1 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{user?.displayName || "Not set"}</p>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl hover:bg-green-50 text-gray-400 hover:text-green-600 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-800 capitalize">{user?.role || "User"}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
              <button
                onClick={() => { setIsEditing(false); setDisplayName(user?.displayName || ""); }}
                className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}