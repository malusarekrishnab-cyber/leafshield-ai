// src/components/UserProfile.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Key, Settings, ChevronDown, UserCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Default avatar - user name चा पहिला अक्षर
  const avatar = user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition border border-green-100"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm">
          {avatar}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden lg:block">
          {user?.displayName || user?.email?.split("@")[0] || "User"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => { setOpen(false); navigate("/profile"); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-3 transition"
            >
              <UserCircle className="w-4 h-4 text-gray-400" />
              Profile
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/change-password"); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-3 transition"
            >
              <Key className="w-4 h-4 text-gray-400" />
              Change Password
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/settings"); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-3 transition"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Settings
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}