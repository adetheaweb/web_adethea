import Sidebar from "./components/Sidebar";
import HeaderSlider from "./components/HeaderSlider";
import ArticleManager from "./components/ArticleManager";
import SettingsManager from "./components/SettingsManager";
import DownloadManager from "./components/DownloadManager";
import StatisticsManager from "./components/StatisticsManager";
import Login from "./components/Login";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SLIDE_ITEMS } from "./constants";
import { Article, SlideItem, FileItem } from "./types";

const INITIAL_ARTICLES: Article[] = [];

import { Sliders, FileText, ChevronRight } from "lucide-react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1"); // 1 = Beranda, 2 = Artikel, 5 = Pengaturan
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([
    { id: '1', name: "Sistem_Konfigurasi_Athethea.json", size: "12 KB", type: "JSON", date: "Baru saja", color: "text-amber-400" },
    { id: '2', name: "Dokumen_Panduan_Admin.pdf", size: "1.2 MB", type: "PDF", date: "1 jam lalu", color: "text-blue-400" }
  ]);
  const [accentColor, setAccentColor] = useState("#6366f1"); // Indigo primary
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@athethea.com");
  const [adminPassword, setAdminPassword] = useState("admin123");

  // Sync state with URL path
  useEffect(() => {
    if (location.pathname === "/admin") {
      setActiveTab("5");
    } else if (location.pathname === "/") {
      // Keep current activeTab if it's already set by user, 
      // but if user manually typed "/" and was in admin, maybe reset?
      // Actually, let's just handle the explicit /admin for now.
    }
  }, [location.pathname]);

  const handleNavigate = (id: string) => {
    setActiveTab(id);
    if (id === "5") {
      navigate("/admin");
    } else if (location.pathname === "/admin") {
      navigate("/");
    }
  };

  // Protected tabs: Only 5 (Pengaturan)
  const isAdminTab = activeTab === "5";

  // Auto-scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div 
      className="min-h-screen flex selection:bg-white/30"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `
          radial-gradient(at 0% 0%, ${accentColor}66 0, transparent 50%), 
          radial-gradient(at 100% 100%, #c026d366 0, transparent 50%)
        `,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sidebar - fixed on desktop */}
      <Sidebar 
        activeId={activeTab} 
        onNavigate={handleNavigate} 
        isLoggedIn={isLoggedIn} 
        onLogout={() => {
          setIsLoggedIn(false);
          setActiveTab("1");
          navigate("/");
        }} 
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-[88px] transition-[padding] duration-300">
        <div className="p-4 lg:p-10 pt-20 lg:pt-10 min-h-screen">
          <AnimatePresence mode="wait">
            {isAdminTab && !isLoggedIn ? (
              <motion.div
                key="login-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <Login 
                  onLogin={() => setIsLoggedIn(true)} 
                  actualEmail={adminEmail}
                  actualPassword={adminPassword}
                />
              </motion.div>
            ) : activeTab === "1" ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto space-y-16"
              >
                {/* Hero Slider */}
                {slides.length > 0 ? (
                  <HeaderSlider slides={slides} />
                ) : (
                  <div className="h-[300px] w-full bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center p-8 backdrop-blur-md">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-white/20">
                      <Sliders size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Selamat Datang di Athethea</h3>
                    <p className="text-white/40 max-w-sm">Siap untuk memulai? Tambahkan slider hero pertama Anda melalui menu Pengaturan.</p>
                  </div>
                )}

                {/* Latest Articles Section */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-white">Artikel Terbaru</h2>
                      <p className="text-white/40">Wawasan terkini seputar teknologi dan desain.</p>
                    </div>
                    {articles.length > 0 && (
                      <button 
                        onClick={() => setActiveTab("2")}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        Lihat Semua →
                      </button>
                    )}
                  </div>
                  
                  {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {articles.slice(0, 3).map((article, i) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 overflow-hidden group hover:border-white/20 transition-all"
                        >
                          <div className="h-48 overflow-hidden">
                              <img src={article.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt={article.title} referrerPolicy="no-referrer" />
                          </div>
                          <div className="p-6">
                              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full mb-4 inline-block">
                                {article.category}
                              </span>
                              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{article.title}</h3>
                              <p className="text-white/60 text-sm line-clamp-2 mb-6">{article.excerpt}</p>
                              <button 
                                onClick={() => {
                                  // For now just navigate to article manager
                                  setActiveTab("2");
                                }}
                                className="text-white text-xs font-bold hover:text-indigo-400 transition-colors"
                              >
                                Baca Selengkapnya
                              </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-20 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto text-white/10">
                        <FileText size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Belum Ada Artikel</h3>
                      <p className="text-white/40">Publikasikan artikel pertama Anda melalui menu manajemen konten.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === "2" ? (
              <motion.div
                key="articles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ArticleManager articles={articles} setArticles={setArticles} />
              </motion.div>
            ) : activeTab === "3" ? (
              <motion.div
                key="downloads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <DownloadManager 
                  isLoggedIn={isLoggedIn} 
                  uploadedFiles={uploadedFiles} 
                  setUploadedFiles={setUploadedFiles}
                />
              </motion.div>
            ) : activeTab === "4" ? (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <StatisticsManager />
              </motion.div>
            ) : activeTab === "5" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsManager 
                  slides={slides} 
                  setSlides={setSlides} 
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  accentColor={accentColor} 
                  setAccentColor={setAccentColor} 
                  adminEmail={adminEmail}
                  adminPassword={adminPassword}
                  setAdminPassword={setAdminPassword}
                />
              </motion.div>
            ) : (
              <motion.div
                key="other"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-20"
              >
                <p className="text-white/40 font-bold text-2xl">Halaman ini sedang dalam pengembangan.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}





