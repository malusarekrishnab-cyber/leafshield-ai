import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, ChevronDown, ChevronUp, Bug, Droplets, Zap, Sun, Leaf, Wind, MapPin } from "lucide-react";

const diseases = [
  // ── Maharashtra / Jalna local crops ──
  {
    name: "Yellow Mosaic Virus (Soybean)",
    scientific: "Mungbean Yellow Mosaic Virus (MYMV)",
    category: "viral",
    severity: "critical",
    plants: "Soybean (Soya), Moong, Urad",
    region: "Jalna, Marathwada",
    symptoms: "Bright yellow mosaic patches on young leaves. Stunted plant growth, small distorted pods, significant yield loss. Spread rapidly by whitefly vectors.",
    treatment: "No cure. Uproot and destroy infected plants immediately. Spray imidacloprid to control whitefly vectors. Use MYMV-resistant varieties like JS-335, MAUS-71.",
    prevention: "Use certified virus-resistant seeds. Apply systemic insecticide at sowing. Monitor fields regularly in early kharif season. Avoid planting near infected fields.",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop"
  },
  {
    name: "Cotton Bollworm",
    scientific: "Helicoverpa armigera",
    category: "pest",
    severity: "critical",
    plants: "Cotton (Kapus), Tomato, Chickpea (Chana)",
    region: "Jalna, Marathwada",
    symptoms: "Circular holes in cotton bolls. Larvae feeding inside bolls and squares. Dry, damaged bolls. Severe infestation causes 30-60% crop loss.",
    treatment: "Spray Emamectin Benzoate 5% SG or Indoxacarb 14.5% SC. Install pheromone traps (5 per acre). Pick and destroy infected bolls.",
    prevention: "Use Bt cotton varieties. Avoid continuous cotton cropping. Install bird perches. Spray neem-based insecticides as preventive measure.",
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop"
  },
  {
    name: "Tur / Pigeon Pea Wilt",
    scientific: "Fusarium udum",
    category: "fungal",
    severity: "high",
    plants: "Tur Dal (Pigeon Pea), Arhar",
    region: "Jalna, Marathwada",
    symptoms: "Sudden wilting of plants despite adequate soil moisture. Yellowing from bottom leaves upward. Brown discoloration inside stem. Plants die before pod formation.",
    treatment: "Remove and burn wilted plants. Drench soil with Carbendazim 0.1% solution. Apply Trichoderma viride to soil at sowing.",
    prevention: "Use wilt-resistant varieties like ICPL-87, BDN-2. Treat seeds with Trichoderma viride before sowing. Practice 3-year crop rotation. Avoid waterlogging.",
    image: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=400&h=300&fit=crop"
  },
  {
    name: "Downy Mildew (Jowar/Sorghum)",
    scientific: "Peronosclerospora sorghi",
    category: "fungal",
    severity: "high",
    plants: "Jowar (Sorghum), Maize",
    region: "Jalna, Marathwada",
    symptoms: "White downy growth on lower leaf surface. Striped chlorosis on upper surface. Affected plants remain dwarf. Entire plant may turn pale green-yellow.",
    treatment: "Spray Metalaxyl + Mancozeb 72% WP at 2.5g/litre. Remove and destroy infected plants. Avoid overhead irrigation.",
    prevention: "Treat seeds with Metalaxyl 35% WS before sowing. Use resistant varieties. Maintain field hygiene. Avoid excess soil moisture.",
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b3b?w=400&h=300&fit=crop"
  },
  {
    name: "Chilli Leaf Curl Virus",
    scientific: "Chilli Leaf Curl Virus (ChiLCV)",
    category: "viral",
    severity: "high",
    plants: "Chilli (Mirchi), Pepper, Tomato",
    region: "Jalna, Maharashtra",
    symptoms: "Upward curling and crinkling of leaves. Reduced leaf size, thick leathery texture. Stunted plant growth, flower drop, very poor fruit set.",
    treatment: "Remove infected plants. Spray Spiromesifen 22.9% SC or Thiamethoxam 25% WG to control whitefly vectors.",
    prevention: "Use virus-free nursery seedlings. Apply reflective mulch to deter whiteflies. Install yellow sticky traps. Spray neem oil during early crop stages.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop"
  },
  {
    name: "Onion Purple Blotch",
    scientific: "Alternaria porri",
    category: "fungal",
    severity: "medium",
    plants: "Onion (Kanda), Garlic (Lasun)",
    region: "Jalna, Nashik, Maharashtra",
    symptoms: "Small white spots with purple centres on leaves. Lesions expand causing complete leaf dieback. Severely affected bulbs develop neck rot in storage.",
    treatment: "Spray Mancozeb 75% WP or Iprodione 50% WP at 10-day intervals. Remove infected leaves. Ensure good field drainage.",
    prevention: "Use healthy certified sets. Avoid excess nitrogen. Maintain row spacing for air circulation. Spray preventively during humid monsoon period.",
    image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400&h=300&fit=crop"
  },
  {
    name: "Wheat Rust (Brown Rust)",
    scientific: "Puccinia triticina",
    category: "fungal",
    severity: "high",
    plants: "Wheat (Gahu), Barley (Jav)",
    region: "Jalna, Marathwada (Rabi season)",
    symptoms: "Small orange-brown pustules on upper leaf surface. Pustules rupture releasing brown powdery spores. Severe infection causes early leaf death and grain shrinkage.",
    treatment: "Spray Propiconazole 25% EC at 0.1% concentration. Apply at first sign of disease. Repeat after 15 days if needed.",
    prevention: "Sow resistant varieties like PBW-343, HD-2781. Avoid late sowing. Monitor fields from January onwards. Apply balanced fertilizer.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop"
  },
  {
    name: "Tomato Early Blight",
    scientific: "Alternaria solani",
    category: "fungal",
    severity: "medium",
    plants: "Tomato (Tamatar), Potato (Batata), Brinjal",
    region: "Maharashtra",
    symptoms: "Dark brown spots with concentric rings (target board pattern) on older leaves. Yellow halo around spots. Fruits show dark sunken lesions near stem end.",
    treatment: "Spray Chlorothalonil 75% WP or Mancozeb 75% WP. Remove affected leaves. Ensure proper staking for air circulation.",
    prevention: "Rotate with non-solanaceous crops. Use certified disease-free seedlings. Avoid overhead irrigation. Apply mulch to prevent soil splash.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
  },
  {
    name: "Soybean Stem Fly",
    scientific: "Melanagromyza sojae",
    category: "pest",
    severity: "medium",
    plants: "Soybean (Soya)",
    region: "Jalna, Marathwada",
    symptoms: "Small yellow spots on cotyledons. Larvae tunnel into stems causing dead heart. Infested seedlings wilt and die. Most damaging in 2-3 week old plants.",
    treatment: "Spray Thiamethoxam 25% WG or Dimethoate 30% EC at seedling stage. Remove and destroy infested plants.",
    prevention: "Treat seeds with Thiamethoxam before sowing. Sow early in kharif season. Maintain field sanitation. Use light trap to monitor adult flies.",
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=300&fit=crop"
  },
  // ── General diseases also common in Maharashtra ──
  {
    name: "Powdery Mildew",
    scientific: "Erysiphales",
    category: "fungal",
    severity: "medium",
    plants: "Tomato, Cucumber, Grape (Draksha), Mango (Amba)",
    region: "Maharashtra",
    symptoms: "White, powdery spots on leaves and stems. Leaves may yellow and drop. Affects plant growth and fruit production.",
    treatment: "Apply fungicides like neem oil or potassium bicarbonate. Remove affected leaves. Improve air circulation.",
    prevention: "Space plants properly, avoid overhead watering, choose resistant varieties, prune regularly for airflow.",
    image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400&h=300&fit=crop"
  },
  {
    name: "Nitrogen Deficiency",
    scientific: "Nutrient Imbalance",
    category: "nutrient_deficiency",
    severity: "medium",
    plants: "All crops — Cotton, Soybean, Jowar, Wheat",
    region: "Marathwada (poor soil areas)",
    symptoms: "Yellowing of older/lower leaves first. Stunted growth. Pale green overall color. Thin stems. Common in Marathwada's light soils.",
    treatment: "Apply urea or DAP fertilizer. Use compost/FYM. Foliar spray of 2% urea for quick correction.",
    prevention: "Regular soil testing at Krishi Vigyan Kendra. Balanced fertilization. Crop rotation with legumes like Tur, Moong.",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
  },
];

const categoryIcons = {
  fungal: { icon: Droplets, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  bacterial: { icon: Bug, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  viral: { icon: Zap, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  nutrient_deficiency: { icon: Leaf, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  pest: { icon: Bug, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  environmental: { icon: Sun, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
};

const severityColors = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function Encyclopedia() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const categories = ["all", "fungal", "bacterial", "viral", "nutrient_deficiency", "pest", "environmental"];

  const filtered = diseases.filter(d => {
    const q = search.toLowerCase();
    const matchesSearch = d.name.toLowerCase().includes(q) ||
      d.plants.toLowerCase().includes(q) ||
      (d.region || "").toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-green-600" />
          Disease Encyclopedia
        </h1>
        <p className="text-gray-400 mt-2">Comprehensive database — Maharashtra &amp; Jalna local crops included</p>
        <div className="flex items-center gap-1.5 mt-2">
          <MapPin className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs text-green-600 font-medium">Localized for Jalna · Marathwada · Maharashtra</span>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            placeholder="Search diseases, crops (e.g. Cotton, Soya, Jowar, Tur)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-green-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none text-sm shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-green-300"
              }`}
            >
              {cat === "all" ? "All" : cat.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Disease Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((disease, i) => {
            const catConfig = categoryIcons[disease.category] || categoryIcons.fungal;
            const isExpanded = expandedId === disease.name;

            return (
              <motion.div
                key={disease.name}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="p-4 sm:p-5 cursor-pointer flex items-center gap-3 sm:gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : disease.name)}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={disease.image} alt={disease.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-gray-800 text-sm sm:text-base">{disease.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[disease.severity]}`}>
                        {disease.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 italic mt-0.5">{disease.scientific}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{disease.plants}</p>
                    {disease.region && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-600 truncate">{disease.region}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className={`hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-medium ${catConfig.bg} ${catConfig.color} ${catConfig.border} border`}>
                      {disease.category.replace("_", " ")}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 grid sm:grid-cols-3 gap-3 sm:gap-4 border-t border-green-50 pt-4">
                        <div className="bg-amber-50/50 rounded-2xl p-4">
                          <h4 className="font-semibold text-sm text-amber-700 mb-2">🔍 Symptoms</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{disease.symptoms}</p>
                        </div>
                        <div className="bg-green-50/50 rounded-2xl p-4">
                          <h4 className="font-semibold text-sm text-green-700 mb-2">💊 Treatment</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{disease.treatment}</p>
                        </div>
                        <div className="bg-blue-50/50 rounded-2xl p-4">
                          <h4 className="font-semibold text-sm text-blue-700 mb-2">🛡️ Prevention</h4>
                          <p className="text-xs text-gray-600 leading-relaxed">{disease.prevention}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Wind className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No diseases found matching your search</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}