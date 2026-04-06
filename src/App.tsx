import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from './lib/firebase';
import { Home } from './views/Home';
import { Feed } from './views/Feed';
import { AdminDashboard } from './views/AdminDashboard';
import { Theaters } from './views/Theaters';
import { Home as HomeIcon, Layers, Shield, Map, Search, X } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';

function Navigation({ isAdmin }: { isAdmin: boolean }) {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
    <Link 
      to={to} 
      className={cn(
        "relative flex flex-col items-center justify-center w-20 h-16 rounded-full transition-all duration-300 z-10",
        active ? "text-white" : "text-white/50 hover:text-white/80"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-active-indicator"
          className="absolute inset-0 bg-gradient-to-br from-pink-500 to-violet-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)] -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className="mb-1 relative z-10">{icon}</div>
      <span className="text-[10px] font-bold tracking-wider relative z-10">{label}</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-2 rounded-full bg-[#1A1525]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
      <NavItem to="/" icon={<HomeIcon className="w-5 h-5" />} label="HOME" active={path === '/'} />
      {!isAdmin && (
        <NavItem to="/feed" icon={<Layers className="w-5 h-5" />} label="FEED" active={path === '/feed'} />
      )}
      {isAdmin && (
        <NavItem to="/admin" icon={<Shield className="w-5 h-5" />} label="ADMIN" active={path === '/admin'} />
      )}
      <NavItem to="/nearby" icon={<Map className="w-5 h-5" />} label="NEARBY" active={path === '/nearby'} />
    </nav>
  );
}

function Header({ user, showAdminLogin, handleTitleClick }: { user: User | null, showAdminLogin: boolean, handleTitleClick: () => void }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="p-6 flex justify-between items-center sticky top-0 z-40 bg-[#0B0914]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        {user?.photoURL && !isSearchOpen && (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
          </div>
        )}
        {!isSearchOpen && (
          <motion.h1 
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-bold tracking-tight text-white cursor-pointer select-none"
            onClick={handleTitleClick}
          >
            Lumiere
          </motion.h1>
        )}
      </div>
      <div className={cn("flex items-center gap-4 transition-all", isSearchOpen ? "w-full" : "")}>
        {isSearchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center w-full relative animate-in fade-in slide-in-from-right-4">
            <input 
              autoFocus
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title cards..."
              className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-4 pr-10 text-sm text-white outline-none focus:border-[#00E5FF] focus:bg-white/15 transition-all"
            />
            <button 
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-white/70 hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <AnimatePresence>
              {(!user && showAdminLogin) && (
                <motion.button 
                  key="admin-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={signInWithGoogle} 
                  className="text-xs font-bold text-white/30 hover:text-white/50 transition-colors uppercase tracking-widest px-2"
                >
                  Admin
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </header>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes({ user, isAdmin }: { user: User | null, isAdmin: boolean }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home isAdmin={isAdmin} /></PageWrapper>} />
        <Route path="/feed" element={<PageWrapper><Feed /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard user={user} isAdmin={isAdmin} /></PageWrapper>} />
        <Route path="/nearby" element={<PageWrapper><Theaters /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Secret login state
  const [loginClicks, setLoginClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email !== 'akdiljith7@gmail.com') {
        await logOut();
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleTitleClick = () => {
    setLoginClicks(prev => {
      const newClicks = prev + 1;
      if (newClicks >= 7) {
        setShowAdminLogin(true);
        return 0;
      }
      return newClicks;
    });

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setLoginClicks(0);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0914] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.email === 'akdiljith7@gmail.com';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0914] text-white font-sans pb-28 selection:bg-white/10 relative">
        {/* Neutral dark background */}
        <div className="absolute inset-0 bg-[#0B0914] pointer-events-none"></div>
        
        <div className="relative z-10">
          <Header user={user} showAdminLogin={showAdminLogin} handleTitleClick={handleTitleClick} />

          <main className="max-w-md mx-auto sm:max-w-2xl w-full">
            <AnimatedRoutes user={user} isAdmin={isAdmin} />
          </main>

          <Navigation isAdmin={isAdmin} />
        </div>
      </div>
    </BrowserRouter>
  );
}
