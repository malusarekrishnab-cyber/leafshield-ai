import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

const leaves = [
  { x: "8%",  y: "18%", size: 28, delay: 0,    duration: 9,  rotate: 45,  drift: 22 },
  { x: "78%", y: "12%", size: 20, delay: 1.2,  duration: 11, rotate: -30, drift: 18 },
  { x: "58%", y: "68%", size: 24, delay: 2.4,  duration: 8,  rotate: 60,  drift: 28 },
  { x: "22%", y: "78%", size: 17, delay: 3.6,  duration: 12, rotate: -45, drift: 15 },
  { x: "88%", y: "48%", size: 22, delay: 0.8,  duration: 10, rotate: 20,  drift: 20 },
  { x: "45%", y: "10%", size: 15, delay: 1.8,  duration: 13, rotate: -15, drift: 12 },
  { x: "5%",  y: "55%", size: 19, delay: 4.2,  duration: 9,  rotate: 75,  drift: 25 },
];

export default function FloatingLeaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute text-green-400/20"
          style={{ left: leaf.x, top: leaf.y }}
          animate={{
            y: [0, -leaf.drift, 0],
            x: [0, leaf.drift * 0.4, 0],
            rotate: [leaf.rotate, leaf.rotate + 18, leaf.rotate - 8, leaf.rotate],
            opacity: [0.15, 0.35, 0.2, 0.15],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: [0.45, 0.05, 0.55, 0.95],
            times: [0, 0.4, 0.7, 1],
          }}
        >
          <Leaf size={leaf.size} />
        </motion.div>
      ))}
    </div>
  );
}