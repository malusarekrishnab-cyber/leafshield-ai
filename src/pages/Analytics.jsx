import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart, Activity, Leaf, Bug, Shield, Calendar } from "lucide-react";
import { PlantScan } from "@/lib/entities";
import { useAuth } from "@/lib/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, AreaChart, Area } from "recharts";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import ConfidenceRing from "@/components/shared/ConfidenceRing";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function Analytics() {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const query = user?.role === "admin" ? {} : { created_by_id: user.uid };
    PlantScan.filter(query, "-created_date", 100).then(data => {
      setScans(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const totalScans = scans.length;
  const healthyCount = scans.filter(s => s.is_healthy).length;
  const diseasedCount = totalScans - healthyCount;
  const avgConfidence = totalScans > 0 ? Math.round(scans.reduce((sum, s) => sum + (s.confidence || 0), 0) / totalScans) : 0;

  const diseaseDistribution = scans.reduce((acc, s) => {
    if (!s.is_healthy) {
      acc[s.disease_name] = (acc[s.disease_name] || 0) + 1;
    }
    return acc;
  }, {});
  const diseaseChartData = Object.entries(diseaseDistribution).map(([name, count]) => ({ name: name?.substring(0, 15), count })).slice(0, 6);

  const healthPieData = [
    { name: "Healthy", value: healthyCount },
    { name: "Diseased", value: diseasedCount },
  ];

  const severityData = ["low", "medium", "high", "critical"].map(s => ({
    severity: s.charAt(0).toUpperCase() + s.slice(1),
    count: scans.filter(scan => scan.severity === s).length,
  }));

  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayScans = scans.filter(s => {
      const scanDate = new Date(s.created_date);
      return scanDate.toDateString() === date.toDateString();
    });
    weeklyData.push({
      day: dayStr,
      scans: dayScans.length,
      healthy: dayScans.filter(s => s.is_healthy).length,
      diseased: dayScans.filter(s => !s.is_healthy).length,
    });
  }

  const statCards = [
    { label: "Total Scans", value: totalScans, icon: BarChart3, color: "from-green-500 to-emerald-600", iconBg: "bg-green-100 text-green-600" },
    { label: "Healthy Plants", value: healthyCount, icon: Leaf, color: "from-emerald-500 to-teal-600", iconBg: "bg-emerald-100 text-emerald-600" },
    { label: "Diseases Found", value: diseasedCount, icon: Bug, color: "from-red-500 to-rose-600", iconBg: "bg-red-100 text-red-600" },
    { label: "Avg Confidence", value: avgConfidence, icon: Shield, suffix: "%", color: "from-blue-500 to-indigo-600", iconBg: "bg-blue-100 text-blue-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-green-600" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          {user?.role === "admin" ? "All users' data (Admin View)" : "तुमच्या स्वतःच्या scans चे insights"}
        </p>
      </motion.div>

      {totalScans === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-green-100">
          <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-gray-400">No Data Yet</h3>
          <p className="text-gray-300 mt-2">Start scanning plants to see analytics here</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-green-50"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} />
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-green-50"
            >
              <h3 className="font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Weekly Scan Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }} />
                    <Area type="monotone" dataKey="scans" stroke="#22c55e" fillOpacity={1} fill="url(#colorScans)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-green-50"
            >
              <h3 className="font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                Health Distribution
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={healthPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-500">Healthy ({healthyCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-500">Diseased ({diseasedCount})</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-green-50"
            >
              <h3 className="font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                Disease Frequency
              </h3>
              {diseaseChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diseaseChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {diseaseChartData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-300">
                  No diseases detected yet
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-green-50"
            >
              <h3 className="font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                Severity Breakdown
              </h3>
              <div className="space-y-4 mt-6">
                {severityData.map((item, i) => {
                  const max = Math.max(...severityData.map(d => d.count), 1);
                  const percent = (item.count / max) * 100;
                  const barColors = ["bg-emerald-500", "bg-amber-500", "bg-orange-500", "bg-red-500"];
                  return (
                    <div key={item.severity}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-600">{item.severity}</span>
                        <span className="text-sm font-bold text-gray-800">{item.count}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                          className={`h-full rounded-full ${barColors[i]}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-center">
                <ConfidenceRing value={avgConfidence} size={100} strokeWidth={7} />
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Average Detection Confidence</p>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}