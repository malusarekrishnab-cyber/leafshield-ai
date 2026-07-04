import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Leaf, AlertTriangle, CheckCircle2, Calendar as CalendarIcon, ScanLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import SeverityBadge from "@/components/shared/SeverityBadge";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Maharashtra Kharif/Rabi season labels
const SEASON = (month) => {
  if (month >= 5 && month <= 9) return { label: "Kharif Season", color: "text-green-600", bg: "bg-green-50" };
  if (month >= 10 && month <= 11) return { label: "Rabi Sowing", color: "text-amber-600", bg: "bg-amber-50" };
  if (month >= 0 && month <= 2) return { label: "Rabi Season", color: "text-blue-600", bg: "bg-blue-50" };
  return { label: "Summer / Off-season", color: "text-orange-500", bg: "bg-orange-50" };
};

export default function Calendar() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null); // { dateStr, scans[] }

  useEffect(() => {
    base44.entities.PlantScan.list().then(data => {
      setScans(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Group scans by date string "YYYY-MM-DD"
  const scansByDate = scans.reduce((acc, scan) => {
    const d = scan.created_date ? new Date(scan.created_date) : null;
    if (!d) return acc;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(scan);
    return acc;
  }, {});

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const season = SEASON(month);

  const prevMonth = () => setCurrent(c => c.month === 0 ? { year: c.year-1, month: 11 } : { ...c, month: c.month-1 });
  const nextMonth = () => setCurrent(c => c.month === 11 ? { year: c.year+1, month: 0 } : { ...c, month: c.month+1 });

  const getDayScans = (day) => {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return scansByDate[key] || [];
  };

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDayClick = (day) => {
    const dayScans = getDayScans(day);
    if (dayScans.length === 0) return;
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelected({ dateStr: `${day} ${MONTHS[month]} ${year}`, scans: dayScans });
  };

  // Month summary stats
  const monthScans = Object.entries(scansByDate)
    .filter(([key]) => key.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
    .flatMap(([, s]) => s);
  const healthyCount = monthScans.filter(s => s.is_healthy).length;
  const diseasedCount = monthScans.filter(s => !s.is_healthy).length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-heading text-2xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="w-7 h-7 text-green-600" />
          Crop Health Calendar
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Track your plant scans through Maharashtra's seasons</p>
      </motion.div>

      {/* Season badge + month stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center mb-5">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${season.bg} ${season.color}`}>
          🌾 {season.label}
        </span>
        {monthScans.length > 0 && (
          <>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> {healthyCount} Healthy
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
              <AlertTriangle className="w-3.5 h-3.5" /> {diseasedCount} Diseased
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200">
              <ScanLine className="w-3.5 h-3.5" /> {monthScans.length} Total Scans
            </span>
          </>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden">

            {/* Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="font-heading text-lg font-bold text-gray-900">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-50">
              {DAYS.map(d => (
                <div key={d} className="text-center py-3 text-xs font-semibold text-gray-400">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20 border-b border-r border-gray-50/60" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayScans = getDayScans(day);
                const hasScans = dayScans.length > 0;
                const allHealthy = hasScans && dayScans.every(s => s.is_healthy);
                const hasDiseased = hasScans && dayScans.some(s => !s.is_healthy);
                const isSelected = selected?.dateStr === `${day} ${MONTHS[month]} ${year}`;

                return (
                  <motion.div
                    key={day}
                    whileHover={hasScans ? { scale: 1.03 } : {}}
                    onClick={() => handleDayClick(day)}
                    className={`h-16 sm:h-20 border-b border-r border-gray-50/60 p-1.5 flex flex-col relative transition-colors
                      ${hasScans ? "cursor-pointer hover:bg-green-50/40" : ""}
                      ${isToday(day) ? "bg-green-50" : ""}
                      ${isSelected ? "bg-green-100 ring-2 ring-green-400 ring-inset" : ""}
                    `}
                  >
                    <span className={`text-xs font-semibold self-start px-1.5 py-0.5 rounded-lg
                      ${isToday(day) ? "bg-green-500 text-white" : "text-gray-500"}`}>
                      {day}
                    </span>

                    {hasScans && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {allHealthy && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-100 rounded px-1">
                            <Leaf className="w-2.5 h-2.5" /> {dayScans.length}
                          </span>
                        )}
                        {hasDiseased && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-100 rounded px-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> {dayScans.filter(s => !s.is_healthy).length}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Healthy scans</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Disease detected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Today</span>
            </div>
          </motion.div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Selected day detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Selected Day</p>
                    <h3 className="font-heading font-bold text-gray-800">{selected.dateStr}</h3>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">✕</button>
                </div>
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                  {selected.scans.map((scan, i) => (
                    <div key={i} className="px-5 py-3">
                      <div className="flex items-start gap-3">
                        {scan.image_url ? (
                          <img src={scan.image_url} alt={scan.plant_name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Leaf className="w-5 h-5 text-green-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{scan.plant_name || "Unknown Plant"}</p>
                          <p className="text-xs text-gray-400 truncate">{scan.disease_name}</p>
                          <div className="mt-1">
                            <SeverityBadge severity={scan.severity} />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {scan.is_healthy
                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                            : <AlertTriangle className="w-5 h-5 text-red-500" />
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-dashed border-green-200 p-8 text-center">
                <CalendarIcon className="w-8 h-8 text-green-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Click a day with scans to see details</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Seasonal care tips */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className={`rounded-3xl border p-5 ${season.bg}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${season.color}`}>🌾 {season.label} Tips</p>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              {month >= 5 && month <= 9 && (<>
                <li>• Soybean — watch for Yellow Mosaic Virus; spray Imidacloprid</li>
                <li>• Cotton — check for Bollworm; use pheromone traps</li>
                <li>• Jowar — inspect for Downy Mildew in humid weather</li>
                <li>• Tur Dal — apply fungicide if Wilt symptoms appear</li>
              </>)}
              {(month === 10 || month === 11) && (<>
                <li>• Wheat sowing — treat seeds before planting</li>
                <li>• Chana — watch for Blight; ensure good drainage</li>
                <li>• Onion nursery — spray against Thrips early</li>
              </>)}
              {month >= 0 && month <= 2 && (<>
                <li>• Wheat — apply second irrigation; watch for Rust</li>
                <li>• Chana & Rabi pulses — check for Pod Borer</li>
                <li>• Onion bulb growth — avoid overwatering</li>
              </>)}
              {month >= 3 && month <= 4 && (<>
                <li>• Pre-monsoon soil preparation for Kharif crops</li>
                <li>• Clear old crop residue to reduce disease carryover</li>
                <li>• Stock up on fungicides and pesticides for Kharif</li>
              </>)}
            </ul>
          </motion.div>

          {/* Quick scan CTA */}
          <Link to="/detect">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="nature-gradient text-white rounded-3xl p-5 cursor-pointer flex items-center gap-4 shadow-lg shadow-green-500/20">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Scan a Plant Now</p>
                <p className="text-green-100 text-xs">Add today's entry to the calendar</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}