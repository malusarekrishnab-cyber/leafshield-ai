import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogOut } from "lucide-react";
import { useSessionTimeout } from "@/lib/useSessionTimeout";
import { base44 } from "@/api/base44Client";

export default function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useSessionTimeout({
    onWarn: () => setShowWarning(true),
    onLogout: () => setShowWarning(false),
  });

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-6 right-6 z-50 bg-white border border-amber-200 rounded-2xl shadow-xl p-4 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Session संपत आहे</p>
              <p className="text-xs text-gray-400 mt-0.5">2 मिनिटांत auto-logout होईल</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Active राहा
                </button>
                <button
                  onClick={() => base44.auth.logout("/login")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}