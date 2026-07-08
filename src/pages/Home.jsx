import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, BookOpen, BarChart3, Leaf, ArrowRight, Shield, Zap, Brain, TrendingUp, Sprout, Bug, MapPin, Bot } from "lucide-react";
import { PlantScan } from "@/lib/entities";
import FloatingLeaves from "@/components/shared/FloatingLeaves";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import DiseaseRiskCard from "@/components/home/DiseaseRiskCard";
import WeatherWidget from '../components/home/WeatherWidget'  // Capital W
const fadeUp = {
  initial: { opacity: 0, y: 48, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export default function Home() {
  const [stats, setStats] = useState({ total: 0, healthy: 0, diseased: 0 });

  useEffect(() => {
    PlantScan.list().then(scans => {
      setStats({
        total: scans.length,
        healthy: scans.filter(s => s.is_healthy).length,
        diseased: scans.filter(s => !s.is_healthy).length,
      });
    }).catch(() => {});
  }, []);

  const features = [
    { icon: Bot, title: "AI Chatbot", desc: "मराठीत विचारा — Jalna शेतकऱ्यांसाठी कृषी सल्ला, रोग माहिती आणि उपाय", color: "from-violet-500 to-purple-600", link: "/chatbot" },
    { icon: Brain, title: "AI-Powered Detection", desc: "Advanced deep learning models analyze leaf patterns with 95%+ accuracy", color: "from-green-500 to-emerald-600" },
    { icon: Zap, title: "Instant Results", desc: "Get disease diagnosis in seconds with detailed treatment recommendations", color: "from-amber-500 to-orange-500" },
    { icon: Shield, title: "Disease Prevention", desc: "Proactive prevention tips and seasonal disease alerts for your crops", color: "from-blue-500 to-cyan-500" },
    { icon: TrendingUp, title: "Data Analytics", desc: "Track crop health trends with interactive charts and statistical insights", color: "from-purple-500 to-pink-500" },
  ];

  const quickStats = [
    { label: "Scans Performed", value: stats.total, icon: ScanLine, color: "text-green-600" },
    { label: "Healthy Plants", value: stats.healthy, icon: Sprout, color: "text-emerald-600" },
    { label: "Diseases Found", value: stats.diseased, icon: Bug, color: "text-red-500" },
  ];

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center">
        <FloatingLeaves />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50/30 to-lime-50/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...stagger} initial="initial" animate="animate" className="space-y-8">
              <motion.div {...fadeUp} className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium border border-green-200/50">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  AI-Powered Plant Care
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200/60">
                  <MapPin className="w-3 h-3" />
                  Jalna · Marathwada · Maharashtra
                </span>
              </motion.div>

              <motion.h1 {...fadeUp} className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                Detect Plant
                <span className="block bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-text text-transparent">
                  Diseases Instantly
                </span>
              </motion.h1>

              <motion.p {...fadeUp} className="text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed">
                Designed for Maharashtra farmers — scan your Cotton, Soybean, Jowar, Tur, Onion & more. Get instant AI diagnosis, treatment advice, and track crop health in Marathi-friendly detail.
              </motion.p>

              <motion.div {...fadeUp} className="flex flex-wrap gap-3 sm:gap-4">
                <Link to="/detect">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    className="nature-gradient text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg flex items-center gap-3 shadow-xl shadow-green-500/20"
                  >
                    <ScanLine className="w-5 h-5" />
                    Start Detection
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/encyclopedia">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-green-700 bg-white border-2 border-green-200 hover:border-green-300 text-base sm:text-lg flex items-center gap-3"
                  >
                    <BookOpen className="w-5 h-5" />
                    Browse Diseases
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div {...fadeUp}>
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Jalna local crops supported</p>
                <div className="flex flex-wrap gap-2">
                  {["🌿 Cotton (Kapus)", "🫘 Soybean", "🌾 Jowar", "🫛 Tur Dal", "🧅 Onion (Kanda)", "🌶️ Chilli", "🌾 Wheat (Gahu)", "🫘 Moong", "🍅 Tomato"].map(crop => (
                    <span key={crop} className="px-2.5 py-1 rounded-lg bg-green-50 border border-green-100 text-xs text-green-700 font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -6, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-green-400/20 to-emerald-500/20 blur-3xl" />
                <div className="relative rounded-[3rem] overflow-hidden border-2 border-white/50 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop"
                    alt="Healthy plants"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 glass-card rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-900">AI Analysis Ready</p>
                        <p className="text-xs text-green-700">Upload a leaf to begin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto mb-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <DiseaseRiskCard />
              <WeatherWidget />
            </div>
            <div className="lg:col-span-2 grid grid-cols-3 gap-4 content-start">
              {quickStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-green-100/50 text-center"
                >
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-green-600 font-semibold text-sm tracking-wider uppercase">Features</span>
            <h2 className="font-heading text-4xl font-bold mt-3 text-gray-900">
              Powerful Plant Intelligence
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Combining cutting-edge AI with agricultural science for comprehensive plant health monitoring.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-500/10 transition-shadow duration-300"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-5`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-[2rem] nature-gradient p-12 sm:p-16 text-center"
        >
          <FloatingLeaves />
          <div className="relative z-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Protect Your Plants?
            </h2>
            <p className="text-green-100 mb-8 max-w-lg mx-auto">
              Start detecting plant diseases now. Upload a photo and get instant AI-powered analysis.
            </p>
            <Link to="/detect">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-700 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-shadow inline-flex items-center gap-3"
              >
                <ScanLine className="w-5 h-5" />
                Detect Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}