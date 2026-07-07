import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History as HistoryIcon, Calendar, Trash2, CheckCircle2, AlertTriangle, Eye, X, ChevronRight, Download, Maximize2 } from "lucide-react";
import SeverityBadge from "@/components/shared/SeverityBadge";
import ConfidenceRing from "@/components/shared/ConfidenceRing";
import ExportModal from "@/components/history/ExportModal";
import PDFDownloadButton from "@/components/shared/PDFExport";
import moment from "moment";

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = () => {
    setLoading(true);
    // ✅ LocalStorage वरून data load करा (झटपट)
    const history = JSON.parse(localStorage.getItem('plantScanHistory') || '[]');
    setScans(history);
    setLoading(false);
  };

  const deleteScan = (id) => {
    // ✅ LocalStorage मधून delete करा
    const updated = scans.filter(s => s.id !== id);
    setScans(updated);
    localStorage.setItem('plantScanHistory', JSON.stringify(updated));
    if (selectedScan?.id === id) setSelectedScan(null);
  };

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-green-600" />
            Scan History
          </h1>
          <p className="text-gray-400 mt-2">तुमचे सर्व scans</p>
        </div>
        {scans.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl nature-gradient text-white font-semibold shadow-lg shadow-green-500/20 text-sm"
          >
            <Download className="w-4 h-4" />
            Export Log
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showExport && <ExportModal scans={scans} onClose={() => setShowExport(false)} />}
      </AnimatePresence>

      {scans.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-green-100">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-gray-400">No Scans Yet</h3>
          <p className="text-gray-300 mt-2">Start scanning plants to build your history</p>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {scans.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedScan(scan)}
                  className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all flex items-center gap-4 ${
                    selectedScan?.id === scan.id
                      ? "border-green-400 ring-2 ring-green-100"
                      : "border-green-50 hover:border-green-200"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {scan.image_url ? (
                      <motion.img
                        src={scan.image_url}
                        alt={scan.plant_name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">🌿</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {scan.is_healthy ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <h3 className="font-semibold text-sm text-gray-800 truncate">
                        {scan.is_healthy ? "Healthy" : scan.disease_name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{scan.plant_name}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{moment(scan.timestamp || scan.created_date).fromNow()}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SeverityBadge severity={scan.severity} />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => { e.stopPropagation(); deleteScan(scan.id); }}
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedScan ? (
                <motion.div
                  key={selectedScan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden sticky top-24"
                >
                  {selectedScan.image_url && (
                    <div className="relative group">
                      <motion.img
                        layoutId={`img-${selectedScan.id}`}
                        src={selectedScan.image_url}
                        alt={selectedScan.plant_name}
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                        <span className="text-white text-xs font-semibold">{selectedScan.plant_name}</span>
                        <div className="flex gap-2">
                          <motion.a
                            href={selectedScan.image_url}
                            target="_blank"
                            rel="noreferrer"
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition"
                            title="View full image"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </motion.a>
                          <motion.a
                            href={selectedScan.image_url}
                            download={`plantai-${selectedScan.plant_name?.replace(/\s+/g, "-").toLowerCase()}.jpg`}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition"
                            title="Download image"
                          >
                            <Download className="w-4 h-4" />
                          </motion.a>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-gray-800">{selectedScan.plant_name}</h3>
                        <p className="text-sm text-gray-400">
                          {selectedScan.is_healthy ? "Healthy ✅" : selectedScan.disease_name}
                        </p>
                      </div>
                      <ConfidenceRing value={selectedScan.confidence || 0} size={70} strokeWidth={5} color={selectedScan.is_healthy ? "#22c55e" : "#ef4444"} />
                    </div>

                    <SeverityBadge severity={selectedScan.severity} />

                    {selectedScan.symptoms && (
                      <div className="bg-amber-50/50 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-amber-700 mb-1">🔍 Symptoms</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{selectedScan.symptoms}</p>
                      </div>
                    )}
                    {selectedScan.treatment && (
                      <div className="bg-green-50/50 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-green-700 mb-1">💊 Treatment</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{selectedScan.treatment}</p>
                      </div>
                    )}
                    {selectedScan.prevention && (
                      <div className="bg-blue-50/50 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-blue-700 mb-1">🛡️ Prevention</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">{selectedScan.prevention}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-green-50 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-gray-300">
                        Scanned {moment(selectedScan.timestamp || selectedScan.created_date).format("MMM DD, YYYY [at] h:mm A")}
                      </p>
                      <PDFDownloadButton scan={selectedScan} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-green-50 text-center sticky top-24"
                >
                  <Eye className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Select a scan to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}