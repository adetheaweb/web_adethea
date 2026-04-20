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
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc,
  getDocsFromServer
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { SLIDE_ITEMS } from "./constants";
import { Article, SlideItem, FileItem, SocialLinks } from "./types";

const INITIAL_ARTICLES: Article[] = [];

import { Sliders, FileText, ChevronRight } from "lucide-react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1"); // 1 = Beranda, 2 = Artikel, 5 = Pengaturan
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [accentColor, setAccentColor] = useState("#6366f1"); // Indigo primary
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("Adetheaweb");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [adminEmail, setAdminEmail] = useState("drivemyfile2019@gmail.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: "@athethea_id",
    instagram: "@athethea.official",
    linkedin: "Athethea Technology",
    github: "athethea-dev"
  });

  // Authentication & Initial Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocsFromServer(query(collection(db, 'articles'), orderBy('date', 'desc')));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Sync: Articles
  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(docs);
    }, (error) => {
      console.error("Articles sync error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Sync: Slides
  useEffect(() => {
    const q = query(collection(db, "slides"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setSlides([]);
      } else {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SlideItem));
        setSlides(docs);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Sync: Files
  useEffect(() => {
    const q = query(collection(db, "public_files"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileItem));
      setUploadedFiles(docs);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Sync: App Settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "app_settings", "general"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.accentColor) setAccentColor(data.accentColor);
        if (data.siteLogo) setSiteLogo(data.siteLogo);
        if (data.siteName) setSiteName(data.siteName);
        if (data.adminEmail) setAdminEmail(data.adminEmail);
        if (data.adminPassword) setAdminPassword(data.adminPassword);
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
        if (data.socialLinks) setSocialLinks(data.socialLinks);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update favicon and title dynamically
  useEffect(() => {
    document.title = siteName;
    
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    if (siteLogo) {
      link.href = siteLogo;
    } else {
      // Default placeholder if no logo
      link.href = "https://picsum.photos/seed/adethea/32/32";
    }
  }, [siteLogo, siteName]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab("1");
    navigate("/");
  };

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
        onLogout={handleLogout} 
        siteLogo={siteLogo}
        siteName={siteName}
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
                    <h3 className="text-xl font-bold text-white mb-2">Selamat Datang di {siteName}</h3>
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
                <ArticleManager articles={articles} setArticles={setArticles} isReadOnly={true} />
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
                  articles={articles}
                  setArticles={setArticles}
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  accentColor={accentColor} 
                  setAccentColor={setAccentColor} 
                  siteLogo={siteLogo}
                  setSiteLogo={setSiteLogo}
                  siteName={siteName}
                  setSiteName={setSiteName}
                  adminEmail={adminEmail}
                  adminPassword={adminPassword}
                  setAdminPassword={setAdminPassword}
                  whatsappNumber={whatsappNumber}
                  setWhatsappNumber={setWhatsappNumber}
                  socialLinks={socialLinks}
                  setSocialLinks={setSocialLinks}
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

        {/* Floating WhatsApp Button */}
        {whatsappNumber && !isAdminTab && (
          <motion.a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-10 h-10"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div className="absolute right-full mr-4 bg-white text-[#0f172a] px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Butuh Bantuan? Chat Kami
            </div>
          </motion.a>
        )}
      </main>
    </div>
  );
}





