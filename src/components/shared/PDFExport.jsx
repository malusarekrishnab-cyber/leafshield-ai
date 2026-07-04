import React from "react";
import { motion } from "framer-motion";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function buildHTML(scan) {
  const severityColor = { low: "#16a34a", medium: "#d97706", high: "#ea580c", critical: "#dc2626" }[scan.severity] || "#6b7280";
  const statusColor = scan.is_healthy ? "#16a34a" : "#dc2626";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 40px; max-width: 800px; margin: auto; }
    .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #16a34a; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #16a34a, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .logo-text { color: white; font-weight: 900; font-size: 22px; }
    .brand { font-size: 24px; font-weight: 800; color: #14532d; }
    .brand span { color: #16a34a; }
    .subtitle { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .status-banner { padding: 16px 24px; border-radius: 14px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .status-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
    .status-title { font-size: 20px; font-weight: 700; }
    .section { background: #f9fafb; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; border-left: 4px solid #d1fae5; }
    .section.warning { border-left-color: #fde68a; }
    .section.blue { border-left-color: #bfdbfe; }
    .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
    .section-value { font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .meta-card { background: #f3f4f6; border-radius: 10px; padding: 14px 16px; }
    .meta-card-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; margin-bottom: 4px; }
    .meta-card-value { font-size: 15px; font-weight: 700; color: #111827; }
    .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${severityColor}20; color: ${severityColor}; border: 1px solid ${severityColor}40; }
    .confidence-bar-bg { height: 8px; background: #e5e7eb; border-radius: 4px; margin-top: 6px; }
    .confidence-bar-fill { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #16a34a, #34d399); width: ${scan.confidence || 0}%; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .footer-text { font-size: 11px; color: #9ca3af; }
    .plant-img { width: 100%; max-height: 260px; object-fit: cover; border-radius: 14px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo"><span class="logo-text">🌿</span></div>
    <div>
      <div class="brand">Plant<span>AI</span> Diagnosis Report</div>
      <div class="subtitle">Generated on ${formatDate(new Date().toISOString())} • LeafShield AI Platform</div>
    </div>
  </div>

  ${scan.image_url ? `<img src="${scan.image_url}" class="plant-img" crossorigin="anonymous" />` : ""}

  <div class="status-banner" style="background:${statusColor}12; border:1px solid ${statusColor}30;">
    <div class="status-dot" style="background:${statusColor};"></div>
    <div>
      <div class="status-title" style="color:${statusColor};">${scan.is_healthy ? "Plant is Healthy ✓" : `Disease Detected: ${scan.disease_name || "Unknown"}`}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:2px;">Plant: ${scan.plant_name || "—"} &nbsp;•&nbsp; Category: ${scan.category || "—"}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-card">
      <div class="meta-card-label">Severity</div>
      <span class="severity-badge">${(scan.severity || "low").charAt(0).toUpperCase() + (scan.severity || "low").slice(1)}</span>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Confidence</div>
      <div class="meta-card-value">${scan.confidence || 0}%</div>
      <div class="confidence-bar-bg"><div class="confidence-bar-fill"></div></div>
    </div>
    <div class="meta-card">
      <div class="meta-card-label">Scan Date</div>
      <div style="font-size:12px;font-weight:600;color:#374151;margin-top:4px;">${formatDate(scan.created_date)}</div>
    </div>
  </div>

  ${scan.symptoms ? `
  <div class="section warning">
    <div class="section-label">🔍 Observed Symptoms</div>
    <div class="section-value">${scan.symptoms}</div>
  </div>` : ""}

  ${scan.treatment ? `
  <div class="section">
    <div class="section-label">💊 Recommended Treatment</div>
    <div class="section-value">${scan.treatment}</div>
  </div>` : ""}

  ${scan.prevention ? `
  <div class="section blue">
    <div class="section-label">🛡️ Prevention Tips</div>
    <div class="section-value">${scan.prevention}</div>
  </div>` : ""}

  <div class="footer">
    <div class="footer-text">PlantAI • AI-Powered Plant Disease Detection</div>
    <div class="footer-text">Scan ID: ${scan.id || "—"}</div>
  </div>
</body>
</html>`;
}

export default function PDFDownloadButton({ scan, className = "" }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const html = buildHTML(scan);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantai-diagnosis-${scan.plant_name?.replace(/\s+/g, "-").toLowerCase() || "report"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleDownload}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {loading ? "Generating..." : "Save Report"}
    </motion.button>
  );
}