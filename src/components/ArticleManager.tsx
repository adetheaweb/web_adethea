import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit3, Image as ImageIcon, Search, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Image as ImageToolIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
  selectedArticle: Article | null;
  setSelectedArticle: (article: Article | null) => void;
}

export default function ArticleManager({ 
  articles, 
  setArticles, 
  isReadOnly = false,
  selectedArticle,
  setSelectedArticle
}: ArticleManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [newArticle, setNewArticle] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "General",
    externalUrl: "",
    coverImage: "",
    gallery: [] as string[],
    textAlign: "left" as 'left' | 'center' | 'right' | 'justify'
  });

  const openEditModal = (article: Article) => {
    setNewArticle({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      externalUrl: article.externalUrl || "",
      coverImage: article.coverImage,
      gallery: article.gallery || [],
      textAlign: article.textAlign || "left"
    });
    setEditingId(article.id);
    setIsAdding(true);
  };

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

  const insertMarkdown = (type: 'link' | 'image') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    let snippet = "";
    if (type === 'link') {
      const url = prompt("Masukkan URL Link:", "https://");
      const label = prompt("Masukkan Nama Link:", "Klik di sini");
      if (url && label) snippet = `[${label}](${url})`;
    } else if (type === 'image') {
      const url = prompt("Masukkan URL Gambar:", "https://");
      const alt = prompt("Masukkan Deskripsi Gambar (Alt):", "Gambar artikel");
      if (url && alt) snippet = `![${alt}](${url})`;
    }

    if (snippet) {
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + snippet + after;
      setNewArticle({ ...newArticle, content: newText });
      
      // Reset focus and cursor position after state update
      setTimeout(() => {
        textarea.focus();
        const newPos = start + snippet.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const articleData = {
      title: newArticle.title,
      excerpt: newArticle.excerpt,
      content: newArticle.content || "Konten artikel ini akan segera hadir...",
      category: newArticle.category,
      coverImage: newArticle.coverImage || `https://picsum.photos/seed/${Date.now()}/800/400`,
      gallery: newArticle.gallery,
      textAlign: newArticle.textAlign,
      externalUrl: newArticle.externalUrl,
      authorUid: auth.currentUser?.uid || "admin",
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "articles", editingId), articleData);
      } else {
        await addDoc(collection(db, "articles"), {
          ...articleData,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setNewArticle({ 
        title: "", 
        excerpt: "", 
        content: "", 
        category: "General", 
        externalUrl: "", 
        coverImage: "", 
        gallery: [],
        textAlign: "left"
      });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, "articles");
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
      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
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
                        <h3 
                          style={{ textAlign: article.textAlign || 'left' }}
                          className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors w-full"
                        >
                          {article.title}
                        </h3>
                        <p 
                          style={{ textAlign: article.textAlign || 'left' }}
                          className="text-white/60 text-sm line-clamp-2 leading-relaxed w-full"
                        >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(article);
                              }}
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
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden flex flex-col shadow-3xl"
          >
            <div className="h-64 lg:h-96 relative">
              <img 
                src={selectedArticle.coverImage} 
                className="w-full h-full object-cover" 
                alt={selectedArticle.title}
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold hover:bg-black transition-all"
              >
                <X size={20} />
                Kembali ke Daftar
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-10 bg-linear-to-t from-[#0f172a] to-transparent">
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
                  {selectedArticle.category}
                </span>
                <h2 className="text-3xl lg:text-6xl font-black text-white leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>
            
            <div className="p-10 lg:p-20">
              <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/10">
                <div className="text-white/40 text-sm font-medium">Diterbitkan pada {selectedArticle.date}</div>
                {selectedArticle.externalUrl && (
                  <a 
                    href={selectedArticle.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/5 hover:bg-white text-white hover:text-indigo-600 px-6 py-3 rounded-2xl font-bold transition-all"
                  >
                    Kunjungi Link Eksternal
                    <ImageIcon size={18} />
                  </a>
                )}
              </div>
              
              <div className="max-w-4xl">
                <p 
                  style={{ textAlign: selectedArticle.textAlign }}
                  className="text-white/90 text-2xl lg:text-3xl leading-snug mb-12 font-bold tracking-tight w-full"
                >
                  {selectedArticle.excerpt}
                </p>
                <div 
                  style={{ textAlign: selectedArticle.textAlign }}
                  className="text-white/60 text-lg leading-relaxed whitespace-pre-wrap font-medium markdown-content w-full"
                >
                  <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                </div>
              </div>

              {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
                <div className="mt-20 space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="h-0.5 flex-1 bg-white/10"></div>
                     <h4 className="text-2xl font-black text-white flex items-center gap-3">
                        <ImageIcon size={28} className="text-indigo-400" />
                        Galeri Gambar
                     </h4>
                     <div className="h-0.5 flex-1 bg-white/10"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedArticle.gallery.map((img, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl group cursor-zoom-in"
                        onClick={() => window.open(img, '_blank')}
                      >
                        <img 
                          src={img} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt={`Gallery ${idx}`}
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-20 pt-12 border-t border-white/10">
                 <button 
                    onClick={() => setSelectedArticle(null)}
                    className="bg-white text-indigo-600 px-10 py-5 rounded-[24px] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
                 >
                    Kembali ke Daftar Artikel
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h2 className="text-3xl font-black text-white mb-6">
                {editingId ? "Edit Artikel" : "Posting Artikel Baru"}
              </h2>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wider block">Halaman Artikel (Konten Lengkap)</label>
                    <div className="flex bg-white/5 p-1 rounded-lg gap-2 border border-white/10 items-center">
                      <div className="flex gap-1 border-r border-white/10 pr-2">
                        <button
                          type="button"
                          onClick={() => insertMarkdown('link')}
                          title="Sisipkan Link"
                          className="p-1.5 rounded transition-all text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <LinkIcon size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('image')}
                          title="Sisipkan Gambar"
                          className="p-1.5 rounded transition-all text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <ImageToolIcon size={16} />
                        </button>
                      </div>
                      
                      <div className="flex gap-1">
                        {[
                          { id: 'left', icon: AlignLeft },
                          { id: 'center', icon: AlignCenter },
                          { id: 'right', icon: AlignRight },
                          { id: 'justify', icon: AlignJustify }
                        ].map((align) => (
                          <button
                            key={align.id}
                            type="button"
                            onClick={() => setNewArticle({ ...newArticle, textAlign: align.id as any })}
                            className={`p-1.5 rounded transition-all ${newArticle.textAlign === align.id ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white'}`}
                          >
                            <align.icon size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea 
                    ref={contentRef}
                    required
                    rows={6}
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Tuliskan isi artikel selengkap mungkin di sini (Mendukung format Markdown)..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all resize-none font-mono text-sm"
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
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    {editingId ? "Simpan Perubahan" : "Publikasikan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Detail View removed from fixed modal, now integrated in main render */}
    </div>
  );
}
