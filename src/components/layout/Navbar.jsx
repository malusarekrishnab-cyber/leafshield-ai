import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, Home, ScanLine, BookOpen, BarChart3, History, 
  Menu, X, Calendar, Bot, ShieldCheck, LogOut,
  PencilIcon, KeyIcon
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/detect", label: "Detect", icon: ScanLine },
  { path: "/encyclopedia", label: "Encyclopedia", icon: BookOpen },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/history", label: "History", icon: History },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/chatbot", label: "AI Chat", icon: Bot },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Default Avatar SVG (जर photoURL नसेल तर)
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50' y='50' font-size='40' text-anchor='middle' dy='.3em' fill='%2364758b'%3E👤%3C/text%3E%3C/svg%3E";

  // Profile Photo URL (बरोबर path)
  const getPhotoURL = () => {
    if (user?.photoURL) return user.photoURL;
    if (user?.photoUrl) return user.photoUrl;
    return defaultAvatar;
  };

  // Display Name (बरोबर path)
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  // Email (बरोबर path)
  const getEmail = () => {
    return user?.email || "email@example.com";
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card shadow-lg shadow-green-900/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <Leaf className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-heading font-bold text-xl text-green-900 tracking-tight">
                Plant<span className="text-green-500">AI</span>
              </span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-green-700"
                          : "text-gray-500 hover:text-green-600"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-pill"
                          className="absolute inset-0 bg-green-50 border border-green-200/50 rounded-xl"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side - Admin Badge + Profile Menu */}
            <div className="hidden md:flex items-center gap-2">
              {user?.role === "admin" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
              )}

              {/* ===== PROFILE MENU (FIXED) ===== */}
              {user && (
                <HeadlessMenu as="div" className="relative">
                  <HeadlessMenu.Button 
                    className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition"
                  >
                    <img
                      className="h-8 w-8 rounded-full border-2 border-green-500 object-cover"
                      src={getPhotoURL()}
                      alt="Profile"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">
                      {getDisplayName()}
                    </span>
                  </HeadlessMenu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <HeadlessMenu.Items className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                      {/* Profile Card - FIXED */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <img
                            className="h-10 w-10 rounded-full border-2 border-green-500 object-cover"
                            src={getPhotoURL()}
                            alt="Profile"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = defaultAvatar;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getDisplayName()}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {getEmail()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                alert("Edit Profile - Change Name");
                              }}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <PencilIcon className="h-4 w-4 mr-3 text-gray-400" />
                              Edit Profile (Change Name)
                            </button>
                          )}
                        </HeadlessMenu.Item>
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                alert("Change Password");
                              }}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                            >
                              <KeyIcon className="h-4 w-4 mr-3 text-gray-400" />
                              Change Password
                            </button>
                          )}
                        </HeadlessMenu.Item>
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } flex w-full items-center px-4 py-2 text-sm text-red-600 border-t border-gray-100 mt-1`}
                            >
                              <LogOut className="h-4 w-4 mr-3 text-red-400" />
                              Sign Out
                            </button>
                          )}
                        </HeadlessMenu.Item>
                      </div>
                    </HeadlessMenu.Items>
                  </Transition>
                </HeadlessMenu>
              )}

              {!user && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => logout()}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition" title="Logout">
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-green-50 text-green-700"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scaleY: 0.95, transformOrigin: "top" }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -12, scaleY: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-x-0 top-16 z-40 glass-card shadow-xl md:hidden border-t border-green-100"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive
                          ? "bg-green-50 text-green-700 border border-green-200/50"
                          : "text-gray-600 hover:bg-green-50/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}