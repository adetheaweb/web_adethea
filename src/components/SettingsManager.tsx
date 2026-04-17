import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  Save,
  Sliders,
  Plus,
  Trash2,
  Image as ImageIcon,
  Chrome,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  HelpCircle,
  Share2,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  BookOpen,
  Info,
  Upload,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { SlideItem, FileItem } from "../types";

interface SettingsManagerProps {
  slides: SlideItem[];
  setSlides: React.Dispatch<React.SetStateAction<SlideItem[]>>;
  uploadedFiles: FileItem[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  accentColor: string;
  setAccentColor: React.Dispatch<React.SetStateAction<string>>;
  adminEmail: string;
  adminPassword: string;
  setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
}

export default function SettingsManager({ 
  slides, 
  setSlides, 
  uploadedFiles, 
  setUploadedFiles, 
  accentColor, 
  setAccentColor,
  adminEmail,
  adminPassword,
  setAdminPassword
}: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Password state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isFilesUploading, setIsFilesUploading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activeSlideForPhoto, setActiveSlideForPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFileName(file.name);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlideForPhoto) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSlide(activeSlideForPhoto, 'imageUrl', event.target.result as string);
          setActiveSlideForPhoto(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = () => {
    if (!newFileName) return;
    setIsFilesUploading(true);
    setFileUploadProgress(0);
    
    const interval = setInterval(() => {
      setFileUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFilesUploading(false);
            setIsFileModalOpen(false);
            
            const fileExt = newFileName.split('.').pop()?.toUpperCase() || 'ZIP';
            let iconColor = "text-blue-400";
            if (fileExt === 'JSON') iconColor = "text-amber-400";
            if (fileExt === 'ZIP') iconColor = "text-purple-400";
            if (fileExt === 'PDF') iconColor = "text-rose-400";

            setUploadedFiles([
              { 
                id: Date.now().toString(), 
                name: newFileName.includes('.') ? newFileName : `${newFileName}.zip`, 
                size: "2.5 MB", 
                type: fileExt, 
                date: "Baru saja",
                color: iconColor
              },
              ...uploadedFiles
            ]);
            setNewFileName("");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handlePasswordSave = () => {
    if (!currentPass || !newPass || !confirmPass) {
      setPassFeedback({ type: 'error', message: 'Harap isi semua bidang password.' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassFeedback({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (currentPass !== adminPassword) {
      setPassFeedback({ type: 'error', message: 'Password saat ini salah.' });
      return;
    }

    setIsSavingPass(true);
    setPassFeedback(null);

    // Simulate saving
    setTimeout(() => {
      setIsSavingPass(false);
      setAdminPassword(newPass);
      setPassFeedback({ type: 'success', message: 'Password admin berhasil diperbarui!' });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      
      // Clear success message after delay
      setTimeout(() => setPassFeedback(null), 5000);
    }, 2000);
  };

  const settingsTabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "social", label: "Media Sosial", icon: Share2 },
    { id: "slider", label: "Slider Hero", icon: Sliders },
    { id: "security", label: "Keamanan", icon: Lock },
    { id: "password", label: "Ubah Password", icon: ShieldCheck },
    { id: "appearance", label: "Tampilan", icon: Palette },
    { id: "files", label: "Layanan File", icon: Download },
    { id: "guide", label: "Panduan Admin", icon: HelpCircle },
  ];

  const colorPresets = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Emerald", value: "#10b981" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Sky", value: "#0ea5e9" },
    { name: "Vivid", value: "#a855f7" },
  ];

  const updateSlide = (id: string, field: keyof SlideItem, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSlide = () => {
    const newSlide: SlideItem = {
      id: Date.now().toString(),
      title: "Judul Slide Baru",
      subtitle: "Deskripsi singkat tentang slide ini.",
      imageUrl: "https://picsum.photos/seed/" + Date.now() + "/1200/600",
      ctaText: "Selengkapnya"
    };
    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">Pengaturan Sistem</h1>
        <p className="text-white/60">Sesuaikan aplikasi Athethea sesuai dengan prevensi dan kenyamanan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Settings Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-xl shadow-black/20 border border-white/10' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 p-8 lg:p-12"
          >
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-white/10">
                  <div className="w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                    A
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Admin Panel</h3>
                    <p className="text-white/40 text-sm mb-4">administrator@athethea.com</p>
                    <button className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all">
                      Ubah Foto Profil
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      defaultValue="Admin Athethea"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Jabatan</label>
                    <input 
                      type="text" 
                      defaultValue="Super User"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Biografi Singkat</label>
                    <textarea 
                      rows={3}
                      defaultValue="Pengembang dan administrator utama platform Athethea."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all resize-none"
                    />
                </div>

                <div className="pt-4">
                  <button className="flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-indigo-500/10">
                    <Save size={20} />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-6">Akun Media Sosial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Twitter", icon: Twitter, color: "text-blue-400", user: "@athethea_id" },
                    { label: "Instagram", icon: Instagram, color: "text-pink-500", user: "@athethea.official" },
                    { label: "LinkedIn", icon: Linkedin, color: "text-blue-600", user: "Athethea Technology" },
                    { label: "GitHub", icon: Github, color: "text-white", user: "athethea-dev" },
                  ].map((social) => (
                    <div key={social.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 group transition-all hover:bg-white/10">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${social.color}`}>
                          <social.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">{social.label}</label>
                          <input 
                            type="text" 
                            defaultValue={social.user}
                            className="w-full bg-transparent border-none text-white outline-none p-0 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <button className="flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-indigo-500/10">
                    <Save size={20} />
                    Hubungkan Akun
                  </button>
                </div>
              </div>
            )}

            {activeTab === "guide" && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Panduan Pengelolaan Admin</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { title: "Manajemen Artikel", desc: "Gunakan menu Artikel untuk menambah, mengedit, atau menghapus postingan blog. Anda dapat mengkategorikan setiap tulisan." },
                    { title: "Kustomisasi Header", desc: "Menu Slider Hero di pengaturan memungkinkan Anda mengubah banner utama di halaman depan web secara instan." },
                    { title: "Data & Statistik", desc: "Pantau performa web Anda melalui menu Statistik untuk melihat jumlah kunjungan dan interaksi pengguna." },
                    { title: "Keamanan Sistem", desc: "Selalu kunci web dengan Mode Pemeliharaan saat melakukan update besar pada database atau struktur kode." },
                  ].map((guide, i) => (
                    <div key={i} className="flex gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group">
                      <div className="text-indigo-400 font-black text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                        0{i+1}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg mb-2">{guide.title}</h4>
                        <p className="text-white/40 text-sm leading-relaxed">{guide.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 flex items-center gap-4">
                  <Info className="text-indigo-400 shrink-0" size={24} />
                  <p className="text-indigo-200/60 text-sm italic">
                    Tip: Gunakan "Warna Aksen" di tab Tampilan untuk mengubah nuansa dashboard sesuai mood brand Anda hari ini.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "slider" && (
              <div className="space-y-8">
                <input 
                  type="file" 
                  ref={photoInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">Kelola Slider Utama</h3>
                  <button 
                    onClick={addSlide}
                    className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-500/30 transition-all"
                  >
                    <Plus size={16} />
                    Tambah Slide
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {slides.map((slide) => (
                      <motion.div 
                        key={slide.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group"
                      >
                        <button 
                          onClick={() => deleteSlide(slide.id)}
                          className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Gambar Slide</label>
                            <div className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 relative group/photo">
                              <img src={slide.imageUrl} className="w-full h-full object-cover" alt="Slide" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  onClick={() => {
                                    setActiveSlideForPhoto(slide.id);
                                    setTimeout(() => photoInputRef.current?.click(), 0);
                                  }}
                                  className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl hover:scale-105 transition-all"
                                >
                                  Ganti Foto
                                </button>
                              </div>
                            </div>
                            <input 
                              type="text" 
                              value={slide.imageUrl}
                              onChange={(e) => updateSlide(slide.id, 'imageUrl', e.target.value)}
                              placeholder="URL Gambar..."
                              className="w-full mt-2 bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white/60 outline-none"
                            />
                          </div>
                          
                          <div className="md:col-span-3 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Judul</label>
                                <input 
                                  type="text" 
                                  value={slide.title}
                                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:bg-white/10"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Teks Tombol (CTA)</label>
                                <input 
                                  type="text" 
                                  value={slide.ctaText}
                                  onChange={(e) => updateSlide(slide.id, 'ctaText', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:bg-white/10"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Sub-judul / Deskripsi</label>
                              <input 
                                type="text" 
                                value={slide.subtitle}
                                onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white outline-none focus:bg-white/10"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-6">Pengamanan & Akses Web</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Mode Pemeliharaan (Maintenance)</h4>
                        <p className="text-white/40 text-sm">Nonaktifkan akses publik sementara waktu.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`w-14 h-8 rounded-full transition-all relative ${maintenanceMode ? 'bg-indigo-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${maintenanceMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                        <EyeOff size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Privasi Konten Otomatis</h4>
                        <p className="text-white/40 text-sm">Sembunyikan artikel jika belum diverifikasi.</p>
                      </div>
                    </div>
                    <button className="w-14 h-8 bg-green-500/40 rounded-full relative cursor-not-allowed">
                       <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-4">
                    <div className="flex items-center gap-3 text-white mb-4">
                       <Chrome size={20} className="text-indigo-400" />
                       <span className="font-bold tracking-tight">API Key Management</span>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 font-mono text-xs text-white/40 break-all border border-white/5">
                      sk_athethea_live_2026_**************************
                    </div>
                    <button className="mt-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                      Regenerate New API Key
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Ubah Password Admin</h3>
                    <p className="text-white/40 text-sm">Perbarui kredensial akses panel kontrol Anda secara berkala.</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-md">
                  <AnimatePresence>
                    {passFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-bold ${
                          passFeedback.type === 'success' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {passFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
                        <span>{passFeedback.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Password Saat Ini</label>
                    <div className="relative group">
                      <input 
                        type={showPass ? "text" : "password"}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono"
                      />
                      <Lock size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Password Baru</label>
                    <div className="relative group">
                      <input 
                        type={showPass ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono"
                      />
                      <button 
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/20 pl-1 mt-1">Minimal 8 karakter dengan kombinasi angka dan simbol.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Konfirmasi Password Baru</label>
                    <div className="relative group">
                      <input 
                        type={showPass ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handlePasswordSave}
                      disabled={isSavingPass}
                      className="w-full flex items-center justify-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait transition-all shadow-xl shadow-indigo-500/10"
                    >
                      {isSavingPass ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>{isSavingPass ? 'Sedang Menyimpan...' : 'Simpan Password Baru'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex items-start gap-4">
                  <Activity className="text-rose-400 shrink-0 mt-1" size={20} />
                  <p className="text-rose-200/60 text-xs leading-relaxed">
                    <strong>Peringatan Keamanan:</strong> Setelah mengganti password, Anda akan diminta untuk masuk kembali menggunakan kredensial baru pada sesi login berikutnya. Jangan berikan password Anda kepada siapa pun.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white mb-2">Personalisasi Tampilan</h3>
                <p className="text-white/40 text-sm mb-8">Sesuaikan warna aksen Athethea untuk mencerminkan identitas brand Anda.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {colorPresets.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setAccentColor(color.value)}
                      className={`group p-6 rounded-3xl border transition-all text-left relative overflow-hidden ${
                        accentColor === color.value 
                        ? 'bg-white/10 border-white/40 ring-2 ring-white/20' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-2xl mb-4 shadow-2xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className={`font-bold block ${accentColor === color.value ? 'text-white' : 'text-white/40'}`}>
                        {color.name}
                      </span>
                      {accentColor === color.value && (
                        <CheckCircle2 className="absolute top-4 right-4 text-white" size={16} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-8">
                  <h4 className="text-white font-bold mb-4">Preview Warna Aktif</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                       <motion.div 
                        className="h-full" 
                        animate={{ backgroundColor: accentColor, width: '75%' }}
                        transition={{ duration: 0.5 }}
                       />
                    </div>
                    <span className="font-mono text-xs text-white/40 uppercase">{accentColor}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Manajemen Database File</h3>
                  <button 
                    onClick={() => setIsFileModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-xl"
                  >
                    <Upload size={18} />
                    <span>Upload Baru</span>
                  </button>
                </div>

                <p className="text-white/40 text-sm">Kelola aset yang tampil di halaman publik Unduhan Athethea.</p>

                <div 
                  onClick={() => setIsFileModalOpen(true)}
                  className="bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] p-12 text-center group hover:border-indigo-500/30 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xl mb-1">Klik atau seret file ke sini</h4>
                      <p className="text-white/30 text-sm">Maksimal ukuran file: 512 MB. Format didukung: PDF, ZIP, MP4, JSON.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold pl-2">File Terunggah Terakhir</h4>
                  <AnimatePresence mode="popLayout">
                    {uploadedFiles.map((file) => (
                      <motion.div 
                        key={file.id} 
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/40 group-hover:text-indigo-400 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-white text-sm font-bold">{file.name}</p>
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">{file.type} • {file.size} • {file.date}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                          className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* File Upload Modal */}
                <AnimatePresence>
                  {isFileModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isFilesUploading && setIsFileModalOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#1e293b] rounded-[40px] border border-white/10 p-8 lg:p-10 shadow-2xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-bold text-white">Upload File Baru</h3>
                          {!isFilesUploading && (
                            <button 
                              onClick={() => setIsFileModalOpen(false)}
                              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                              <CheckCircle2 className="rotate-45" size={20} />
                            </button>
                          )}
                        </div>

                        {!isFilesUploading ? (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Nama File</label>
                              <input 
                                type="text" 
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="Masukkan nama file..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                              />
                            </div>

                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-white/10 rounded-3xl p-10 text-center bg-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group"
                            >
                              <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <Upload className="mx-auto text-indigo-400 mb-4 group-hover:scale-110 transition-transform" size={32} />
                              <p className="text-white font-medium">Klik untuk memilih file</p>
                              <p className="text-white/30 text-xs mt-1">Pilih file dari perangkat Anda</p>
                            </div>

                            <button 
                              onClick={handleFileUpload}
                              disabled={!newFileName}
                              className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20"
                            >
                              Mulai Unggah
                            </button>
                          </div>
                        ) : (
                          <div className="py-12 flex flex-col items-center">
                            <div className="relative w-32 h-32 mb-8">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="58"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-white/5"
                                />
                                <motion.circle
                                  cx="64"
                                  cy="64"
                                  r="58"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray="364.42"
                                  animate={{ strokeDashoffset: 364.42 - (364.42 * fileUploadProgress) / 100 }}
                                  className="text-indigo-500"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-white">{fileUploadProgress}%</span>
                              </div>
                            </div>
                            <h4 className="text-white font-bold text-xl mb-2">Mengunggah File...</h4>
                            <p className="text-white/40 text-sm">{newFileName}</p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab !== "profile" && activeTab !== "slider" && activeTab !== "security" && activeTab !== "appearance" && activeTab !== "social" && activeTab !== "guide" && activeTab !== "files" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Segera Hadir</h3>
                <p className="text-white/40 max-w-xs">Modul {activeTab} sedang dalam tahap finalisasi pengembangan.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
