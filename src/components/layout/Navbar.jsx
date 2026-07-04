import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Home, ScanLine, BookOpen, BarChart3, History, Menu, X, Calendar, Bot, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

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

            {/* Admin badge + logout (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {user?.role === "admin" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
              )}
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => logout()}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition" title="Logout">
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-green-50 text-green-700"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

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