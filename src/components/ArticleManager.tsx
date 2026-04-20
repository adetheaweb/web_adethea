import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit3, Image as ImageIcon, Search, X } from "lucide-react";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc,
  updateDoc 
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Article } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ArticleManagerProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  isReadOnly?: boolean;
}

export default function ArticleManager({ articles, setArticles, isReadOnly = false }: ArticleManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState("");
  const [newArticle, setNewArticle] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    externalUrl: "",
    coverImage: "",
    gallery: [] as string[]
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewArticle({ ...newArticle, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 10 - newArticle.gallery.length;
      const filesArray = Array.from(files) as File[];
      const filesToProcess = filesArray.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewArticle(prev => ({
            ...prev,
            gallery: [...prev.gallery, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setNewArticle(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const articleData = {
      title: newArticle.title,
      excerpt: newArticle.excerpt,
      content: newArticle.content || "Konten artikel ini akan segera hadir...",
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      category: newArticle.category,
      coverImage: newArticle.coverImage || `https://picsum.photos/seed/${Date.now()}/800/400`,
      gallery: newArticle.gallery,
      externalUrl: newArticle.externalUrl,
      authorUid: auth.currentUser?.uid || "admin",
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "articles"), articleData);
      setIsAdding(false);
      setNewArticle({ title: "", excerpt: "", content: "", category: "General", externalUrl: "", coverImage: "", gallery: [] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "articles");
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `articles/${id}`);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
            {isReadOnly ? "Daftar Artikel" : "Pengelolaan Artikel"}
          </h1>
          <p className="text-white/60">
            {isReadOnly 
              ? "Telusuri wawasan terkini dan berita terbaru dari Athethea." 
              : "Buat, edit, dan publikasikan artikel terbaru Anda ke seluruh dunia."}
          </p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-indigo-500/10"
          >
            <Plus size={20} />
            Tulis Artikel Baru
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari judul atau kategori..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all"
          />
        </div>
        <select className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer min-w-[150px]">
          <option value="all">Semua Kategori</option>
          <option value="tech">Tech</option>
          <option value="design">Design</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article) => (
            <motion.div
              layout
              key={article.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group hover:border-white/20 transition-all flex flex-col md:flex-row"
            >
              <div 
                className="md:w-48 h-48 md:h-auto overflow-hidden cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <img 
                  src={article.coverImage} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="cursor-pointer" onClick={() => setSelectedArticle(article)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-white/40 text-xs">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 mt-6">
                  {article.externalUrl && (
                    <a 
                      href={article.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-white/40 hover:text-white underline underline-offset-4"
                    >
                      Kunjungi Link
                    </a>
                  )}
                  {!isReadOnly && (
                    <div className="flex gap-2 ml-auto">
                      <button 
                        onClick={() => setSelectedArticle(article)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteArticle(article.id);
                        }}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1e293b] border border-white/10 w-full max-w-2xl p-8 rounded-[40px] relative z-10 shadow-3xl shadow-black/50 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h2 className="text-3xl font-black text-white mb-6">Posting Artikel Baru</h2>
              <form onSubmit={handleAddArticle} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Upload Cover</label>
                      <div 
                        className="relative group h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden"
                        onClick={() => document.getElementById('coverInput')?.click()}
                      >
                        {newArticle.coverImage ? (
                          <img src={newArticle.coverImage} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <>
                            <ImageIcon className="text-white/20 group-hover:text-white/40 mb-2" size={32} />
                            <span className="text-xs text-white/40 group-hover:text-white/60">Pilih Gambar</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          id="coverInput"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Judul Artikel</label>
                      <input 
                        required
                        type="text" 
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                        placeholder="Masukkan judul..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Target URL (Opsional)</label>
                      <input 
                        type="url" 
                        value={newArticle.externalUrl}
                        onChange={(e) => setNewArticle({...newArticle, externalUrl: e.target.value})}
                        placeholder="https://example.com/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Kategori</label>
                      <input 
                        type="text" 
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                        placeholder="Tech, Design..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Ringkasan</label>
                      <textarea 
                        required
                        rows={2}
                        value={newArticle.excerpt}
                        onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                        placeholder="Tulis ringkasan singkat..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 resize-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">Halaman Artikel (Konten Lengkap)</label>
                  <textarea 
                    required
                    rows={6}
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Tuliskan isi artikel selengkap mungkin di sini..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-4 flex items-center justify-between">
                    Galeri Gambar Tambahan
                    <span className="text-[10px] lowercase font-normal opacity-50 underline">{newArticle.gallery.length}/10 gambar</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {newArticle.gallery.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                        <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                        <button 
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    {newArticle.gallery.length < 10 && (
                      <button 
                        type="button"
                        onClick={() => document.getElementById('galleryInput')?.click()}
                        className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/20 hover:bg-white/10 hover:border-white/20 transition-all group"
                      >
                        <Plus size={24} className="group-hover:text-white/40 transition-colors" />
                        <span className="text-[10px] mt-2 group-hover:text-white/40 font-bold uppercase tracking-tighter">Tambah</span>
                        <input 
                          type="file" 
                          id="galleryInput"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryUpload}
                          className="hidden" 
                        />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Publikasikan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-[#1e293b] border border-white/10 w-full max-w-4xl rounded-[48px] relative z-10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-64 lg:h-80 relative">
                <img 
                  src={selectedArticle.coverImage} 
                  className="w-full h-full object-cover" 
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black transition-all"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-6 left-10">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>
              <div className="p-10 lg:p-16 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                  <div className="text-white/40 text-sm italic">Diterbitkan pada {selectedArticle.date}</div>
                  {selectedArticle.externalUrl && (
                    <a 
                      href={selectedArticle.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 font-bold hover:underline"
                    >
                      Kunjungi Link Eksternal →
                    </a>
                  )}
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/80 text-xl leading-relaxed mb-8 font-medium">
                    {selectedArticle.excerpt}
                  </p>
                  <div className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </div>
                </div>

                {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
                  <div className="mt-12 space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                       <ImageIcon size={20} className="text-indigo-400" />
                       Galeri Gambar
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {selectedArticle.gallery.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-xl group cursor-zoom-in"
                        >
                          <img 
                            src={img} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={`Gallery ${idx}`}
                            referrerPolicy="no-referrer"
                            onClick={() => window.open(img, '_blank')}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
