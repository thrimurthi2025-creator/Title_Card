import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, signInWithGoogle, logOut, db } from './lib/firebase';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';
import { Home } from './views/Home';
import { Feed } from './views/Feed';
import { AdminDashboard } from './views/AdminDashboard';
import { Theaters } from './views/Theaters';
import { Profile } from './views/Profile';
import { MovieDetails } from './views/MovieDetails';
import { Home as HomeIcon, Layers, Shield, Map, Search, X, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { LoginModal } from './components/LoginModal';
import { CommentBottomSheet } from './components/CommentBottomSheet';

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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-2 rounded-full bg-white/5 backdrop-blur-[32px] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] transition-transform duration-300 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none overflow-hidden">
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

function Header({ user, showAdminLogin, handleTitleClick, onLoginClick }: { user: User | null, showAdminLogin: boolean, handleTitleClick: () => void, onLoginClick: () => void }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
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
    <header className="sticky top-0 z-40 bg-white/[0.03] backdrop-blur-[32px] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
      <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
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
            {user ? (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1A1525] border border-white/10 rounded-2xl p-2 shadow-xl">
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 p-2 text-white/80 hover:bg-white/5 rounded-xl">
                      <UserIcon className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={() => { logOut(); setShowMenu(false); }} className="flex items-center gap-2 p-2 text-red-400 hover:bg-white/5 rounded-xl w-full">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="text-xs font-bold text-white hover:text-white/80 transition-colors uppercase tracking-widest px-4 py-2 bg-white/10 rounded-full"
              >
                Login
              </button>
            )}
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

function AnimatedRoutes({ user, isAdmin, setActiveMovieId }: { user: User | null, isAdmin: boolean, setActiveMovieId: (id: string | null) => void }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home user={user} isAdmin={isAdmin} /></PageWrapper>} />
        <Route path="/feed" element={<PageWrapper><Feed user={user} setActiveMovieId={setActiveMovieId} /></PageWrapper>} />
        <Route path="/movie/:id" element={<PageWrapper><MovieDetails user={user} /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard user={user} isAdmin={isAdmin} /></PageWrapper>} />
        <Route path="/nearby" element={<PageWrapper><Theaters /></PageWrapper>} />
        {user && <Route path="/profile" element={<PageWrapper><Profile user={user} /></PageWrapper>} />}
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);
  
  // Secret login state
  const [loginClicks, setLoginClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Store user in Firestore on first login
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              name: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'users/' + currentUser.uid);
        }
        setUser(currentUser);
      } else {
        setUser(null);
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
      <div className="min-h-screen bg-[#0B0914] text-white font-sans pb-32 selection:bg-white/10 relative overflow-x-hidden">
        {/* Neutral dark background */}
        <div className="fixed inset-0 bg-[#0B0914] -z-10"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header user={user} showAdminLogin={showAdminLogin} handleTitleClick={handleTitleClick} onLoginClick={() => setIsLoginModalOpen(true)} />

          <main className="flex-1 w-full max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedRoutes user={user} isAdmin={isAdmin} setActiveMovieId={setActiveMovieId} />
          </main>

          <Navigation isAdmin={isAdmin} />
          <CommentBottomSheet 
            isOpen={!!activeMovieId} 
            onClose={() => setActiveMovieId(null)} 
            movieId={activeMovieId || ''} 
            user={user} 
            onRestrictedAction={() => setIsLoginModalOpen(true)}
          />
          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
      </div>
    </BrowserRouter>
  );
}
