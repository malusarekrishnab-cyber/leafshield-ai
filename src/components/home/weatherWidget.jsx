import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, RefreshCw, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";

const WeatherIcon = ({ condition }) => {
  const c = (condition || "").toLowerCase();
  if (c.includes("rain") || c.includes("पाऊस")) return <CloudRain className="w-8 h-8 text-blue-500" />;
  if (c.includes("cloud") || c.includes("ढग")) return <Cloud className="w-8 h-8 text-gray-400" />;
  return <Sun className="w-8 h-8 text-amber-400" />;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Generate a realistic current weather report for Jalna, Maharashtra, India for today (${new Date().toDateString()}).
      
Consider: Jalna is in Marathwada, dry zone, current season is ${new Date().toLocaleString('default',{month:'long'})} which is ${new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? 'monsoon/Kharif season' : new Date().getMonth() >= 10 ? 'Rabi sowing season' : 'Rabi/summer season'}.

Return JSON with:
- temp_c: number (realistic for Jalna this season)
- feels_like_c: number  
- humidity_pct: number
- wind_kmh: number
- condition: string in Marathi (e.g. "उन्हाळी", "पावसाळी", "ढगाळ", "स्वच्छ ऊन")
- condition_en: string (Sunny/Rainy/Cloudy/Partly Cloudy)
- rain_chance_pct: number
- rain_mm_today: number
- forecast_3day: array of 3 objects: { day: string (Marathi day name), temp_high: number, temp_low: number, rain_chance: number, icon: "sun"|"cloud"|"rain" }
- farming_alert: string (short Marathi farming tip based on weather, mention local crop)
- uv_index: number`,
      response_json_schema: {
        type: "object",
        properties: {
          temp_c: { type: "number" },
          feels_like_c: { type: "number" },
          humidity_pct: { type: "number" },
          wind_kmh: { type: "number" },
          condition: { type: "string" },
          condition_en: { type: "string" },
          rain_chance_pct: { type: "number" },
          rain_mm_today: { type: "number" },
          forecast_3day: { type: "array", items: { type: "object" } },
          farming_alert: { type: "string" },
          uv_index: { type: "number" },
        }
      }
    }).then(d => { setWeather(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs font-bold text-blue-700">जालना हवामान</p>
            <p className="text-[10px] text-blue-400">Jalna, Maharashtra</p>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={fetch}
          className="p-1.5 rounded-lg bg-white/60 hover:bg-white text-blue-400 transition">
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-white/60 rounded-2xl" />
          <div className="h-4 bg-white/60 rounded-full w-3/4" />
          <div className="h-4 bg-white/60 rounded-full w-1/2" />
        </div>
      ) : weather ? (
        <>
          {/* Main temp */}
          <div className="flex items-center gap-4 mb-4">
            <WeatherIcon condition={weather.condition_en} />
            <div>
              <p className="text-4xl font-bold text-gray-800">{weather.temp_c}°<span className="text-xl text-gray-400">C</span></p>
              <p className="text-sm text-blue-600 font-medium">{weather.condition}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Droplets, label: "आर्द्रता", value: `${weather.humidity_pct}%`, color: "text-blue-500" },
              { icon: Wind, label: "वारा", value: `${weather.wind_kmh} km/h`, color: "text-teal-500" },
              { icon: CloudRain, label: "पाऊस शक्यता", value: `${weather.rain_chance_pct}%`, color: "text-indigo-500" },
            ].map(w => (
              <div key={w.label} className="bg-white/60 rounded-xl p-2 text-center">
                <w.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${w.color}`} />
                <p className="text-xs font-bold text-gray-700">{w.value}</p>
                <p className="text-[10px] text-gray-400">{w.label}</p>
              </div>
            ))}
          </div>

          {/* 3-day forecast */}
          {weather.forecast_3day?.length > 0 && (
            <div className="flex gap-2 mb-4">
              {weather.forecast_3day.map((d, i) => (
                <div key={i} className="flex-1 bg-white/60 rounded-xl p-2 text-center">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1">{d.day}</p>
                  {d.icon === "rain" ? <CloudRain className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                    : d.icon === "cloud" ? <Cloud className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                    : <Sun className="w-4 h-4 mx-auto text-amber-400 mb-1" />}
                  <p className="text-xs font-bold text-gray-700">{d.temp_high}°</p>
                  <p className="text-[10px] text-gray-400">{d.temp_low}°</p>
                </div>
              ))}
            </div>
          )}

          {/* Farming alert */}
          {weather.farming_alert && (
            <div className="bg-white/70 rounded-xl p-3 flex gap-2">
              <span className="text-base flex-shrink-0">🌾</span>
              <p className="text-xs text-gray-600 leading-relaxed">{weather.farming_alert}</p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">हवामान माहिती उपलब्ध नाही</p>
      )}
    </motion.div>
  );
}