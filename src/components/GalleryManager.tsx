import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, Search, X, Maximize2, Calendar, Layout } from "lucide-react";
import { GalleryItem } from "../types";

interface GalleryManagerProps {
  items: GalleryItem[];
}

export default function GalleryManager({ items }: GalleryManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">Gallery Visual</h1>
          <p className="text-white/60">Koleksi dokumentasi kegiatan, prestasi, dan momen berharga Adetheaweb.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Cari foto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-medium"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedImage(item)}
              className="group relative aspect-square bg-white/5 rounded-[32px] overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all"
            >
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar size={12} />
                    <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-indigo-600">
                <Maximize2 size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-white/10 rounded-[40px] text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/10">
            <ImageIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tidak ditemukan</h3>
          <p className="text-white/40 max-w-xs mx-auto">Kami tidak dapat menemukan foto dengan kata kunci tersebut.</p>
        </div>
      )}

      {/* Lightbox / Preview */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white/5 rounded-[40px] overflow-hidden border border-white/10 flex flex-col md:flex-row"
            >
              <div className="flex-1 p-2 md:p-4 bg-black/40 flex items-center justify-center">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="w-full md:w-80 p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-6 right-6 p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                    <Layout size={10} />
                    <span>Detail Visual</span>
                  </div>
                  
                  <h3 className="text-3xl font-black text-white leading-tight mb-4">{selectedImage.title}</h3>
                  <p className="text-white/40 leading-relaxed font-medium mb-6">
                    {selectedImage.description || "Tidak ada deskripsi tambahan untuk momen ini."}
                  </p>
                  
                  <div className="flex items-center gap-3 text-white/20 text-sm font-bold border-t border-white/5 pt-6">
                    <Calendar size={18} />
                    <span>Terbit pada {new Date(selectedImage.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                   <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mb-4">Bagikan Momen</p>
                   <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-xs transition-all">Link</button>
                      <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-xs transition-all">Sosmed</button>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
