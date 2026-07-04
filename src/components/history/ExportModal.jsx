import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, Loader2, Table2 } from "lucide-react";
import moment from "moment";

function toCSV(scans) {
  const headers = ["Date", "Plant Name", "Disease", "Healthy", "Confidence (%)", "Severity", "Category", "Symptoms", "Treatment", "Prevention"];
  const rows = scans.map(s => [
    moment(s.created_date).format("YYYY-MM-DD HH:mm"),
    s.plant_name || "",
    s.disease_name || "",
    s.is_healthy ? "Yes" : "No",
    s.confidence || "",
    s.severity || "",
    s.category || "",
    (s.symptoms || "").replace(/,/g, ";"),
    (s.treatment || "").replace(/,/g, ";"),
    (s.prevention || "").replace(/,/g, ";"),
  ]);
  return [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
}

function toJSON(scans) {
  return JSON.stringify(scans.map(s => ({
    date: moment(s.created_date).format("YYYY-MM-DD HH:mm"),
    plant_name: s.plant_name,
    disease: s.disease_name,
    healthy: s.is_healthy,
    confidence_pct: s.confidence,
    severity: s.severity,
    category: s.category,
    symptoms: s.symptoms,
    treatment: s.treatment,
    prevention: s.prevention,
  })), null, 2);
}

// Minimal HTML table export that opens in Excel
function toHTMLTable(scans) {
  const headers = ["Date", "Plant", "Disease", "Healthy", "Confidence", "Severity", "Category", "Symptoms", "Treatment", "Prevention"];
  const rows = scans.map(s => [
    moment(s.created_date).format("YYYY-MM-DD HH:mm"),
    s.plant_name || "",
    s.disease_name || "",
    s.is_healthy ? "✅ Yes" : "❌ No",
    `${s.confidence || 0}%`,
    s.severity || "",
    s.category || "",
    s.symptoms || "",
    s.treatment || "",
    s.prevention || "",
  ]);

  const headerHTML = headers.map(h => `<th style="background:#16a34a;color:#fff;padding:8px 12px;text-align:left;font-family:Arial">${h}</th>`).join("");
  const rowsHTML = rows.map((r, ri) =>
    `<tr style="background:${ri % 2 === 0 ? "#f0fdf4" : "#fff"}">${r.map(v => `<td style="padding:7px 12px;font-family:Arial;font-size:12px;border-bottom:1px solid #e5e7eb">${v}</td>`).join("")}</tr>`
  ).join("");

  return `<html><head><meta charset="utf-8"/></head><body>
    <h2 style="font-family:Arial;color:#15803d">🌿 PlantAI — Scan History Log</h2>
    <p style="font-family:Arial;color:#6b7280;font-size:12px">Exported ${moment().format("MMMM D, YYYY [at] h:mm A")} · ${scans.length} records</p>
    <table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%">
      <thead><tr>${headerHTML}</tr></thead>
      <tbody>${rowsHTML}</tbody>
    </table>
  </body></html>`;
}

const exportFormats = [
  {
    id: "csv",
    label: "CSV Spreadsheet",
    desc: "Opens in Excel, Google Sheets, Numbers",
    icon: Table2,
    color: "from-green-500 to-emerald-600",
    badge: "Most Compatible",
  },
  {
    id: "xls",
    label: "Excel-Style HTML",
    desc: "Formatted table — open directly in Excel",
    icon: FileSpreadsheet,
    color: "from-emerald-500 to-teal-600",
    badge: "Best Formatting",
  },
  {
    id: "json",
    label: "JSON Data",
    desc: "Raw structured data for developers",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    badge: "Data Science",
  },
];

export default function ExportModal({ scans, onClose }) {
  const [selected, setSelected] = useState("csv");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      let content, filename, type;
      if (selected === "csv") {
        content = toCSV(scans);
        filename = `plantai-scan-history-${moment().format("YYYY-MM-DD")}.csv`;
        type = "text/csv";
      } else if (selected === "xls") {
        content = toHTMLTable(scans);
        filename = `plantai-scan-history-${moment().format("YYYY-MM-DD")}.xls`;
        type = "application/vnd.ms-excel";
      } else {
        content = toJSON(scans);
        filename = `plantai-scan-history-${moment().format("YYYY-MM-DD")}.json`;
        type = "application/json";
      }
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setLoading(false);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="nature-gradient p-6 relative overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Export Scan History</h2>
              <p className="text-green-100 text-sm">{scans.length} records ready to export</p>
            </div>
          </div>
        </div>

        {/* Format Picker */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Choose Format</p>
          {exportFormats.map(fmt => (
            <motion.button
              key={fmt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(fmt.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                selected === fmt.id
                  ? "border-green-400 bg-green-50/50 shadow-md shadow-green-500/10"
                  : "border-gray-100 hover:border-green-200"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${fmt.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <fmt.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800">{fmt.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">{fmt.badge}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{fmt.desc}</p>
              </div>
              <motion.div
                animate={{ scale: selected === fmt.id ? 1 : 0 }}
                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </motion.div>
            </motion.button>
          ))}

          {/* Columns Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">Exported columns include:</p>
            <div className="flex flex-wrap gap-1.5">
              {["Date", "Plant", "Disease", "Healthy?", "Confidence", "Severity", "Category", "Symptoms", "Treatment", "Prevention"].map(c => (
                <span key={c} className="px-2 py-0.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500">{c}</span>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            disabled={loading || done}
            className="w-full mt-2 py-4 rounded-2xl font-semibold text-white nature-gradient shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-80"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Preparing file...</>
            ) : done ? (
              <><CheckCircle2 className="w-5 h-5" /> Downloaded! ✨</>
            ) : (
              <><Download className="w-5 h-5" /> Download {selected.toUpperCase()}</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}