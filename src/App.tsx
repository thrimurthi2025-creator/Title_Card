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
import { Privacy } from './views/Privacy';
import { About } from './views/About';
import { Terms } from './views/Terms';
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
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-active-indicator"
          className="absolute inset-0 bg-tertiary rounded-full shadow-pop -z-10 border-2 border-foreground"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className="mb-1 relative z-10">{icon}</div>
      <span className="text-[10px] font-bold tracking-wider relative z-10 uppercase">{label}</span>
    </Link>
  );

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-2 rounded-full bg-white/40 backdrop-blur-xl border border-white/30 shadow-pop transition-transform duration-300 overflow-hidden">
      <NavItem to="/" icon={<HomeIcon className="w-5 h-5" strokeWidth={2.5} />} label="HOME" active={path === '/'} />
      {!isAdmin && (
        <NavItem to="/feed" icon={<Layers className="w-5 h-5" strokeWidth={2.5} />} label="FEED" active={path === '/feed'} />
      )}
      {isAdmin && (
        <NavItem to="/admin" icon={<Shield className="w-5 h-5" strokeWidth={2.5} />} label="ADMIN" active={path === '/admin'} />
      )}
      <NavItem to="/nearby" icon={<Map className="w-5 h-5" strokeWidth={2.5} />} label="NEARBY" active={path === '/nearby'} />
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
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b-2 border-foreground shadow-sm">
      <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
        {!isSearchOpen && (
          <motion.h1 
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-heading font-extrabold tracking-tight text-foreground cursor-pointer select-none"
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
              className="w-full bg-white border-2 border-foreground rounded-full py-2 pl-4 pr-10 text-sm text-foreground outline-none focus:border-accent focus:shadow-pop transition-all"
            />
            <button 
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </form>
        ) : (
          <>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-foreground hover:bg-tertiary rounded-full transition-colors border-2 border-transparent hover:border-foreground hover:shadow-pop-hover active:shadow-pop-active"
            >
              <Search className="w-6 h-6" strokeWidth={2.5} />
            </button>
            {user ? (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all">
                  <img src={user.photoURL || ''} alt="User" className="w-full h-full object-cover" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-foreground rounded-2xl p-2 shadow-pop">
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 p-2 text-foreground hover:bg-tertiary rounded-xl font-bold">
                      <UserIcon className="w-4 h-4" strokeWidth={2.5} /> Profile
                    </Link>
                    <Link to="/privacy" onClick={() => setShowMenu(false)} className="flex items-center gap-2 p-2 text-foreground hover:bg-tertiary rounded-xl font-bold">
                      Privacy Policy
                    </Link>
                    <Link to="/about" onClick={() => setShowMenu(false)} className="flex items-center gap-2 p-2 text-foreground hover:bg-tertiary rounded-xl font-bold">
                      About
                    </Link>
                    <a href="mailto:thrimurthi2025@gmail.com" onClick={() => setShowMenu(false)} className="flex items-center gap-2 p-2 text-foreground hover:bg-tertiary rounded-xl font-bold">
                      Contact
                    </a>
                    <button onClick={() => { logOut(); setShowMenu(false); }} className="flex items-center gap-2 p-2 text-secondary hover:bg-secondary/10 rounded-xl w-full font-bold">
                      <LogOut className="w-4 h-4" strokeWidth={2.5} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="text-xs font-bold text-white hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase tracking-widest px-6 py-3 bg-accent rounded-full border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
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
                  className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest px-2"
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
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-foreground border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.email === 'akdiljith7@gmail.com';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground font-sans pb-32 selection:bg-accent/20 relative overflow-x-hidden">
        {/* Playful background with dot pattern */}
        <div className="fixed inset-0 bg-background bg-dot-pattern -z-10"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header user={user} showAdminLogin={showAdminLogin} handleTitleClick={handleTitleClick} onLoginClick={() => setIsLoginModalOpen(true)} />

          <main className="flex-1 w-full max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 sm:px-6 lg:px-8">
            <AnimatedRoutes user={user} isAdmin={isAdmin} setActiveMovieId={setActiveMovieId} />
          </main>

          <footer className="py-8 text-center text-muted-foreground text-xs opacity-70">
            <p className="mb-2">© 2026 Lumiere. Made with ♥️</p>
            <div className="flex justify-center gap-4">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/about">About</Link>
              <Link to="/terms">Terms</Link>
              <a href="mailto:thrimurthi2025@gmail.com">Contact</a>
            </div>
          </footer>

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
