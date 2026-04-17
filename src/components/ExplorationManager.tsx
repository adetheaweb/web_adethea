import React from "react";
import { motion } from "motion/react";
import { Compass, Globe, Sparkles, TrendingUp, Zap, Users } from "lucide-react";

export default function ExplorationManager() {
  const categories = [
    { title: "Teknologi Global", icon: Globe, count: 124, color: "from-blue-500 to-indigo-500" },
    { title: "Trending Hari Ini", icon: TrendingUp, count: 42, color: "from-amber-500 to-orange-500" },
    { title: "Inspirasi Kreatif", icon: Sparkles, count: 89, color: "from-purple-500 to-pink-500" },
    { title: "Update Cepat", icon: Zap, count: 215, color: "from-emerald-500 to-teal-500" },
    { title: "Komunitas", icon: Users, count: 1540, color: "from-indigo-500 to-cyan-500" },
    { title: "Panduan Sistem", icon: Compass, count: 12, color: "from-rose-500 to-red-500" },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">Eksplorasi Athethea</h1>
        <p className="text-white/60">Temukan topik menarik dan tren terbaru di seluruh platform kami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 p-8 overflow-hidden cursor-pointer"
          >
            <div className={`w-16 h-16 rounded-3xl bg-linear-to-br ${cat.color} flex items-center justify-center text-white mb-6 shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-500`}>
              <cat.icon size={32} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">{cat.title}</h3>
              <p className="text-white/40 text-sm">{cat.count} Postingan Menarik</p>
            </div>

            <div className="mt-8 flex items-center text-indigo-400 font-bold text-sm">
              <span>Jelajahi Sekarang</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="ml-2"
              >
                →
              </motion.span>
            </div>

            {/* Decorative blob */}
            <div className={`absolute -right-12 -bottom-12 w-48 h-48 bg-linear-to-br ${cat.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-linear-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-[48px] p-12 border border-white/10 text-center relative overflow-hidden"
      >
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-white animate-pulse">
            <Sparkles size={32} />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-white">Temukan Sesuatu yang Baru?</h2>
          <p className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed">
            Algoritma cerdas kami siap memberikan rekomendasi konten yang paling sesuai dengan minat dan gaya Anda.
          </p>
          <button className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold hover:scale-105 transition-all shadow-2xl">
            Aktifkan Rekomendasi
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />
      </motion.div>
    </div>
  );
}
