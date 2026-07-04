import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudRain, Thermometer, Wind, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const riskColors = {
  Low: { bg: "from-emerald-50 to-green-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500" },
  Medium: { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  High: { bg: "from-orange-50 to-red-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500" },
  Critical: { bg: "from-red-50 to-rose-50", border: "border-red-200", badge: "bg-red-100 text-red-700", bar: "bg-red-500" },
};

export default function DiseaseRiskCard() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRisk = () => {
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert agricultural AI assistant specializing in Maharashtra, India farming conditions — specifically Jalna district in the Marathwada region.

Generate a realistic daily plant disease risk forecast for today (${new Date().toDateString()}) for Jalna, Maharashtra farmers.

Consider:
- Jalna is in dry Marathwada zone — hot summers, moderate monsoon, typical crops: Cotton (Kapus), Soybean (Soya), Jowar (Sorghum), Tur Dal (Pigeon Pea), Moong, Chana, Wheat, Onion, Tomato, Chilli
- Current season context (July = Kharif sowing/monsoon season)
- Local pests: Bollworm, White Fly, Aphids, Helicoverpa, Thrips
- Common diseases: Yellow Mosaic Virus (Soya), Alternaria Blight (Sunflower), Wilt (Tur), Downy Mildew (Jowar), Leaf Curl (Chilli), Boll Rot (Cotton)

Return a JSON with:
- overall_risk: "Low" | "Medium" | "High" | "Critical"
- risk_score: number 0-100
- temperature_c: number (realistic Jalna temperature)
- humidity_pct: number
- wind_kmh: number
- top_threats: array of 3 objects: { disease: string, probability_pct: number, affected_crops: string } — use local Jalna crop names
- tip: string (practical tip relevant to Jalna farmers, mention local crop names)
- summary: string (2 sentence forecast mentioning Jalna/Marathwada)

Make it realistic, specific to Jalna district, and varied each time.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_risk: { type: "string" },
          risk_score: { type: "number" },
          temperature_c: { type: "number" },
          humidity_pct: { type: "number" },
          wind_kmh: { type: "number" },
          top_threats: {
            type: "array",
            items: {
              type: "object",
              properties: {
                disease: { type: "string" },
                probability_pct: { type: "number" },
                affected_crops: { type: "string" }
              }
            }
          },
          tip: { type: "string" },
          summary: { type: "string" }
        }
      }
    }).then(data => {
      setRisk(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchRisk(); }, []);

  const colors = risk ? (riskColors[risk.overall_risk] || riskColors.Low) : riskColors.Low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-3xl p-6 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Disease Risk</p>
          {risk && (
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
              {risk.overall_risk} Risk
            </span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.85, rotate: 180 }}
          onClick={fetchRisk}
          className="p-2 rounded-xl bg-white/60 hover:bg-white text-gray-500"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-white/60 rounded-full w-3/4" />
          <div className="h-4 bg-white/60 rounded-full w-1/2" />
          <div className="h-4 bg-white/60 rounded-full w-2/3" />
        </div>
      ) : risk ? (
        <>
          {/* Weather Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Thermometer, label: `${risk.temperature_c}°C`, sub: "Temp" },
              { icon: CloudRain, label: `${risk.humidity_pct}%`, sub: "Humidity" },
              { icon: Wind, label: `${risk.wind_kmh} km/h`, sub: "Wind" },
            ].map(w => (
              <div key={w.sub} className="bg-white/60 rounded-xl p-2.5 text-center">
                <w.icon className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                <p className="text-sm font-bold text-gray-700">{w.label}</p>
                <p className="text-xs text-gray-400">{w.sub}</p>
              </div>
            ))}
          </div>

          {/* Risk Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Risk Level</span>
              <span className="font-bold">{risk.risk_score}/100</span>
            </div>
            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.risk_score}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`h-full rounded-full ${colors.bar}`}
              />
            </div>
          </div>

          {/* Top Threats */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-500">Top Threats Today</p>
            {risk.top_threats?.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/50 rounded-xl p-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{t.disease}</p>
                  <p className="text-xs text-gray-400 truncate">{t.affected_crops}</p>
                </div>
                <span className="text-xs font-bold text-orange-600">{t.probability_pct}%</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="bg-white/60 rounded-xl p-3 flex gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">{risk.tip}</p>
          </div>
        </>
      ) : null}
    </motion.div>
  );
}