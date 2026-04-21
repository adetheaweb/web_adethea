import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, FileText, FileJson, Image as ImageIcon, Music, Video, Search, CheckCircle2, Loader2, Upload, X, ShieldAlert } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FileItem } from "../types";

interface DownloadManagerProps {
  isLoggedIn?: boolean;
  uploadedFiles?: FileItem[];
  setUploadedFiles?: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function DownloadManager({ 
  isLoggedIn = false, 
  uploadedFiles = [], 
  setUploadedFiles 
}: DownloadManagerProps) {
  const [completed, setCompleted] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Map file extension to Lucide components
  const getFileIcon = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'PDF') return FileText;
    if (t === 'JSON') return FileJson;
    if (t === 'ZIP' || t === 'RAR') return Download;
    if (['JPG', 'PNG', 'SVG', 'WEBP'].includes(t)) return ImageIcon;
    if (['MP4', 'MOV', 'AVI'].includes(t)) return Video;
    if (['MP3', 'WAV'].includes(t)) return Music;
    return FileText;
  };

  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredFiles = uploadedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (file: FileItem) => {
    try {
      if (file.content && file.content.startsWith('data:')) {
        // Direct browser download for base64 content
        const link = document.createElement('a');
        link.href = file.content;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Safety timeout for cleanup
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } else if (file.href) {
        // If it's a real URL, we try to force download if it's not a cross-origin conflict
        const link = document.createElement('a');
        link.href = file.href;
        link.target = '_blank';
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } else {
        alert("File ini tidak memiliki konten unduhan yang valid.");
      }
      
      setCompleted(`Berhasil: ${file.name}`);
      setTimeout(() => setCompleted(null), 3000);
    } catch (error) {
      console.error("Download failed:", error);
      setCompleted("Gagal mengunduh file");
      setTimeout(() => setCompleted(null), 3000);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    
    const reader = new FileReader();
    
    reader.onprogress = (data) => {
      if (data.lengthComputable) {
        const progress = Math.round((data.loaded / data.total) * 100);
        setUploadProgress(progress);
      }
    };

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const fileExt = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';
      
      let iconColor = "text-blue-400";
      if (fileExt === 'JSON') iconColor = "text-amber-400";
      if (fileExt === 'ZIP') iconColor = "text-purple-400";
      if (fileExt === 'PDF') iconColor = "text-rose-400";

      const newFile = { 
        name: newFileName || selectedFile.name, 
        size: (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB", 
        type: fileExt, 
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        content: content,
        color: iconColor,
        createdAt: new Date().toISOString()
      };

      try {
        await addDoc(collection(db, "public_files"), newFile);
        setIsUploading(false);
        setIsUploadModalOpen(false);
        setCompleted(`File "${newFileName || selectedFile.name}" Berhasil Diunggah`);
        setNewFileName("");
        setSelectedFile(null);
        setTimeout(() => setCompleted(null), 3000);
      } catch (error) {
        console.error("Upload to Firestore error:", error);
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      console.error("File reading error");
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setNewFileName(file.name);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">Pusat Unduhan</h1>
          <p className="text-white/60">Akses dokumen, aset media, dan file sistem untuk keperluan administratif.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-indigo-500/20"
            >
              <Upload size={18} />
              <span>Upload Baru</span>
            </button>
          )}

          <AnimatePresence mode="wait">
            {completed && (
              <motion.div 
                key="success-toast"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl"
              >
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">{completed}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Cari file..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-medium"
        />
      </div>

      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredFiles.map((file, i) => {
            const Icon = getFileIcon(file.type);
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${file.color || 'text-white/40'} group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-white mb-1">{file.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-white/30 uppercase tracking-widest">
                    <span>{file.type}</span>
                    <span>•</span>
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.date}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDownload(file)}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all group/btn min-w-[140px] justify-center bg-white/10 hover:bg-white text-white hover:text-indigo-600"
                >
                  <Download size={18} className="group-hover/btn:scale-110 transition-transform" />
                  <span>Unduh</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/5 border border-white/10 rounded-[40px] text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/10">
            <Download size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Belum Ada File</h3>
          <p className="text-white/40 max-w-xs mx-auto">Database unduhan saat ini masih kosong. Admin akan segera menambahkan file terbaru.</p>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white">Butuh File Spesifik?</h3>
          <p className="text-white/40">Jika Anda tidak menemukan file yang Anda cari, hubungi tim IT atau administrator sistem pusat.</p>
          <button className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Hubungi Support →</button>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-[40px] shadow-3xl overflow-hidden relative"
            >
              <div className="p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                      <Upload size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Upload Aset Baru</h3>
                  </div>
                  <button 
                    onClick={() => !isUploading && setIsUploadModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {!isUploading ? (
                    <>
                      <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl p-10 text-center group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden">
                        <input 
                          type="file" 
                          onChange={onFileSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <Upload size={40} className="mx-auto text-white/20 mb-4 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-white font-bold mb-1 truncate px-4">
                          {selectedFile ? selectedFile.name : "Klik untuk memilih file"}
                        </p>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
                          {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Maks. 10 MB Disarankan"}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Nama File</label>
                          <input 
                            type="text" 
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Contoh: Dokumen_Strategi_2026.pdf"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Kategori / Folder</label>
                          <select className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 transition-all appearance-none cursor-pointer">
                            <option className="bg-[#1e293b]">Dokumen PDF</option>
                            <option className="bg-[#1e293b]">Aset Gambar</option>
                            <option className="bg-[#1e293b]">Media Video</option>
                            <option className="bg-[#1e293b]">File Sistem</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        onClick={handleFileUpload}
                        disabled={!selectedFile}
                        className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mulai Proses Upload
                      </button>
                    </>
                  ) : (
                    <div className="py-10 text-center space-y-8">
                       <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                             <circle 
                                className="text-white/5 stroke-current" 
                                strokeWidth="8" 
                                fill="transparent" 
                                r="40" 
                                cx="50" 
                                cy="50" 
                             />
                             <motion.circle 
                                className="text-indigo-500 stroke-current" 
                                strokeWidth="8" 
                                strokeLinecap="round"
                                fill="transparent" 
                                r="40" 
                                cx="50" 
                                cy="50" 
                                strokeDasharray="251.2"
                                animate={{ strokeDashoffset: 251.2 - (251.2 * uploadProgress) / 100 }}
                             />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className="text-2xl font-black text-white">{uploadProgress}%</span>
                          </div>
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg mb-2">Sedang Mengunggah...</h4>
                          <p className="text-white/40 text-sm">Harap jangan menutup browser selama proses berlangsung.</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 p-6 border-t border-white/10 flex items-center gap-4">
                 <ShieldAlert className="text-indigo-400 shrink-0" size={20} />
                 <p className="text-[10px] text-white/40 leading-relaxed italic">
                    File yang diunggah akan segera tersedia untuk semua pengguna setelah verifikasi integritas data selesai.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
