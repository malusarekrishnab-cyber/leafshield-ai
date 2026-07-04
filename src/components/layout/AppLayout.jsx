import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import SessionWarning from "@/components/SessionWarning";

const pageVariants = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -16, filter: "blur(4px)", transition: { duration: 0.25, ease: [0.55, 0, 1, 0.45] } },
};

function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen leaf-pattern">
      <Navbar />
      <main>
        <AnimatedOutlet />
      </main>
      <SessionWarning />
    </div>
  );
}