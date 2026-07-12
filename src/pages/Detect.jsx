import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Camera, ScanLine, Loader2, CheckCircle2, AlertTriangle,
  Leaf, ArrowLeft, RotateCcw, FileImage, Download, Sparkles, Video, X
} from "lucide-react";
import ConfidenceRing from "@/components/shared/ConfidenceRing";
import SeverityBadge from "@/components/shared/SeverityBadge";
import { useRateLimit } from "@/lib/useRateLimit";
import { Link } from "react-router-dom";

export default function Detect() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("upload");
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const checkRate = useRateLimit(5, 60_000);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch {}
  };

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      setImage(file);
      setPreview(URL.createObjectURL(blob));
      setStep("preview");
      setResult(null);
      closeCamera();
    }, "image/jpeg", 0.92);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStep("preview");
    setResult(null);
    setRetryCount(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setStep("preview");
    setResult(null);
    setRetryCount(0);
  };

  const analyzeWithRetry = async (attempt = 0) => {
    const { allowed, waitSec } = checkRate();
    if (!allowed) {
      setRateLimitMsg(`खूप जास्त scans! ${waitSec} सेकंद थांबा.`);
      setTimeout(() => setRateLimitMsg(""), waitSec * 1000);
      return;
    }
    setRateLimitMsg("");
    setLoading(true);
    setStep("analyzing");

    try {
 const formData = new FormData();
formData.append("file", image);

const response = await fetch("http://127.0.0.1:8000/predict", {
  method: "POST",
  body: formData,
});

if (!response.ok) {
  throw new Error(`Backend Error ${response.status}`);
}

const analysis = await response.json();

const scanData = {
  image_url: preview,
  plant_name: analysis.plant || "Unknown",
  disease_name: analysis.disease || "Unknown",
  confidence: analysis.confidence || 0,
  is_healthy: analysis.healthy || false,
  severity: analysis.severity || "unknown",
  symptoms: analysis.symptoms || "",
  treatment: analysis.treatment || "",
  prevention: analysis.prevention || "",
  category: "Plant Disease",
};
      const history = JSON.parse(localStorage.getItem('plantScanHistory') || '[]');
      history.unshift({
        ...scanData,
        timestamp: new Date().toISOString(),
        id: Date.now()
      });
      localStorage.setItem('plantScanHistory', JSON.stringify(history.slice(0, 50)));

      setResult(scanData);
      setStep("result");
      setRetryCount(0);
    } catch (err) {
      console.error("Analysis attempt", attempt + 1, "failed:", err);
      
      // Rate limit error - retry after 3 seconds
      if (err.message.includes("429") || err.message.includes("rate-limited")) {
        if (attempt < 3) {
          setRateLimitMsg(`Rate limit hit! Retrying in ${(attempt + 1) * 2} seconds...`);
          setTimeout(() => {
            setRateLimitMsg("");
            analyzeWithRetry(attempt + 1);
          }, (attempt + 1) * 2000);
          return;
        } else {
          setRateLimitMsg("Too many requests. Please wait 30 seconds and try again.");
          setStep("preview");
          setLoading(false);
          return;
        }
      }
      
      // Other errors - show fallback
      setRateLimitMsg("Analysis failed: " + err.message);
      
      const fallbackData = {
        image_url: preview,
        plant_name: "Unknown",
        disease_name: "Analysis Failed",
        is_healthy: false,
        confidence: 50,
        severity: "medium",
        symptoms: "Unable to analyze. Please try again.",
        treatment: "Retry or consult an expert.",
        prevention: "Take clear photo in good lighting.",
        category: "other",
      };
      setResult(fallbackData);
      setStep("result");
      setLoading(false);
    } finally {
      if (!rateLimitMsg.includes("Retrying")) {
        setLoading(false);
      }
    }
  };

  const analyzeImage = () => {
    analyzeWithRetry(0);
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setStep("upload");
    setRetryCount(0);
    setRateLimitMsg("");
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-600 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="font-heading text-2xl sm:text-4xl font-bold text-gray-900">
          🔬 Disease Detection
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">Upload a photo of your Cotton, Soya, Jowar, Tur or any plant leaf</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="group cursor-pointer border-2 border-dashed border-green-300 hover:border-green-500 rounded-3xl p-8 sm:p-16 text-center bg-gradient-to-br from-green-50/50 to-emerald-50/30 transition-all hover:shadow-xl hover:shadow-green-500/10"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30"
              >
                <Upload className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">
                Upload Plant Leaf Image
              </h3>
              <p className="text-gray-400 mb-6">
                Drag & drop or click to select a photo of the affected leaf
              </p>
              <div className="flex justify-center gap-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-green-200 text-sm text-green-700">
                  <FileImage className="w-4 h-4" /> JPG, PNG, WEBP
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-green-200 text-sm text-green-700">
                  <Camera className="w-4 h-4" /> Take Photo
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={openCamera}
              className="mt-4 w-full py-3 rounded-2xl border-2 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold flex items-center justify-center gap-2 transition"
            >
              <Video className="w-5 h-5" /> Camera वापरून Scan करा
            </motion.button>

            <AnimatePresence>
              {cameraOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-h-[70vh] object-cover" />
                  <div className="flex gap-4 mt-6">
                    <button onClick={closeCamera} className="p-4 rounded-full bg-white/20 text-white">
                      <X className="w-6 h-6" />
                    </button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={capturePhoto}
                      className="w-16 h-16 rounded-full bg-white border-4 border-green-400 shadow-xl" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-green-100">
              <div className="relative">
                <img src={preview} alt="Plant leaf" className="w-full max-h-96 object-contain bg-gray-50" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={reset}
                    className="p-2 rounded-xl bg-white/90 shadow-lg text-gray-600 hover:text-red-500"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <div className="p-6">
                {rateLimitMsg && (
                  <div className={`text-sm rounded-xl px-4 py-2 text-center mb-3 ${
                    rateLimitMsg.includes("Retrying") 
                      ? "text-yellow-600 bg-yellow-50"
                      : "text-red-500 bg-red-50"
                  }`}>
                    {rateLimitMsg}
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyzeImage}
                  disabled={loading}
                  className={`w-full text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-500/20 ${
                    loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-5 h-5" />
                      Analyze with AI
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 rounded-3xl p-12 shadow-xl border border-green-100 text-center overflow-hidden"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-green-300/40"
                style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 25}%` }}
                animate={{ y: [0, -18, 0], rotate: [0, 20, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              >
                <Leaf size={12 + (i % 3) * 6} />
              </motion.div>
            ))}

            <div className="relative w-32 h-32 mx-auto mb-8">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-green-400/30"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                />
              ))}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-emerald-400"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-4 border-transparent border-b-lime-500 border-l-green-400"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/40">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </div>

            <motion.h3
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-heading text-2xl font-bold text-gray-800 mb-2"
            >
              Analyzing Your Plant...
            </motion.h3>
            <p className="text-gray-400 text-sm mb-8">AI is examining leaf patterns &amp; identifying diseases</p>

            {rateLimitMsg && (
              <div className="text-yellow-600 bg-yellow-50 rounded-xl px-4 py-2 mb-4">
                {rateLimitMsg}
              </div>
            )}

            <div className="space-y-3 max-w-xs mx-auto text-left">
              {["Uploading image...", "Detecting leaf structure...", "Identifying disease patterns...", "Generating diagnosis..."].map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.6, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.6 + 0.2 }}
                    className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: i * 0.6 }}
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                    />
                  </motion.div>
                  <span className="text-xs text-gray-500">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`rounded-3xl p-6 flex items-center gap-4 ${
                result.is_healthy
                  ? "bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200"
                  : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                {result.is_healthy ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                )}
              </motion.div>
              <div>
                <h3 className="font-heading text-xl font-bold text-gray-800">
                  {result.is_healthy ? "Plant is Healthy! 🌿" : `Disease Detected: ${result.disease_name}`}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Plant: {result.plant_name} • Category: {result.category}
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-green-100"
              >
                <img src={preview} alt="Scanned plant" className="w-full h-48 object-cover" />
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Severity</p>
                    <SeverityBadge severity={result.severity} />
                  </div>
                  <ConfidenceRing
                    value={result.confidence}
                    size={90}
                    strokeWidth={6}
                    color={result.is_healthy ? "#22c55e" : "#ef4444"}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-green-100"
              >
                <h4 className="font-heading font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">🔍</span>
                  Symptoms
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">{result.symptoms}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-green-100"
              >
                <h4 className="font-heading font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">💊</span>
                  Treatment
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">{result.treatment}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-green-100"
              >
                <h4 className="font-heading font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">🛡️</span>
                  Prevention
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">{result.prevention}</p>
              </motion.div>
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={reset}
                className="flex-1 min-w-[120px] py-4 rounded-2xl font-semibold bg-white border-2 border-green-200 text-green-700 flex items-center justify-center gap-2 hover:bg-green-50 transition"
              >
                <RotateCcw className="w-5 h-5" />
                Scan Another
              </motion.button>
              <motion.a
                href={preview}
                download={`plantai-${result.plant_name?.replace(/\s+/g, "-").toLowerCase() || "scan"}.jpg`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 min-w-[120px] py-4 rounded-2xl font-semibold bg-white border-2 border-blue-200 text-blue-700 flex items-center justify-center gap-2 hover:bg-blue-50 transition"
              >
                <Download className="w-5 h-5" />
                Save Image
              </motion.a>
              <Link to="/history" className="flex-1 min-w-[120px]">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-center gap-2 shadow-lg hover:from-green-700 hover:to-emerald-700"
                >
                  <Sparkles className="w-5 h-5" />
                  View History
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}