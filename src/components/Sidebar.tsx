import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Compass, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { MENU_ITEMS, MenuItem } from "../constants";

const iconMap: Record<string, any> = {
  Home,
  Compass,
  BarChart2,
  Settings,
  HelpCircle,
  FileText,
  Download,
  LogOut
};

interface SidebarProps {
  activeId: string;
  onNavigate: (id: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  siteLogo: string | null;
  siteName: string;
}

export default function Sidebar({ activeId, onNavigate, isLoggedIn, onLogout, siteLogo, siteName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const adminTabs = ["5"];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsOpen(false);
      else setIsOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between z-50 lg:hidden">
          <button 
            onClick={() => onNavigate("1")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
              {siteLogo ? (
                <img src={siteLogo} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <span className="text-white font-bold text-lg">{siteName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="font-bold text-xl tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{siteName}</span>
          </button>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-2xl z-40 pt-20 px-6 lg:hidden"
            >
              <nav className="flex flex-col gap-4">
                {isLoggedIn && (
                  <div className="flex items-center gap-4 p-4 mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold leading-none">Admin Athethea</p>
                      <button 
                        onClick={onLogout}
                        className="text-indigo-400 text-xs font-bold hover:underline"
                      >
                        Keluar (Logout)
                      </button>
                    </div>
                  </div>
                )}
                {MENU_ITEMS.map((item: MenuItem) => {
                  const Icon = iconMap[item.icon];
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center gap-4 p-4 text-lg font-medium rounded-xl transition-all w-full text-left ${
                        activeId === item.id ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={24} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 88 }}
      className="fixed left-0 top-0 h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 overflow-hidden"
    >
      <div className="p-6 mb-8 flex items-center justify-between">
        <button 
          onClick={() => onNavigate("1")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 overflow-hidden">
            {siteLogo ? (
              <img src={siteLogo} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span className="text-white font-bold text-xl">{siteName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-2xl tracking-tighter bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
            >
              {siteName}
            </motion.span>
          )}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {isLoggedIn && (
          <div className={`flex items-center gap-4 mb-8 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl overflow-hidden transition-all ${isOpen ? 'p-4' : 'p-2'}`}>
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={20} />
            </div>
            {isOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-white text-xs font-black uppercase tracking-widest leading-none mb-1">Administrator</p>
                <p className="text-white/40 text-[10px] truncate">Admin Panel Active</p>
              </motion.div>
            )}
          </div>
        )}
        {MENU_ITEMS.map((item: MenuItem) => {
          const Icon = iconMap[item.icon];
          const isAdmin = adminTabs.includes(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all group relative w-full text-left ${
                activeId === item.id ? 'bg-white/10 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Icon size={24} className="flex-shrink-0" />
                {isAdmin && !isLoggedIn && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/20 border border-white/5 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
              </div>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {!isOpen && (
                <div className="absolute left-20 bg-white/10 backdrop-blur-xl border border-white/10 text-white px-3 py-2 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        {isLoggedIn && (
          <button
            onClick={onLogout}
            className={`flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all w-full text-left group overflow-hidden`}
          >
            <LogOut size={24} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
            {isOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-sm">
                Keluar
              </motion.span>
            )}
          </button>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-3 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all underline-offset-4"
        >
          {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>
    </motion.aside>
  );
}
