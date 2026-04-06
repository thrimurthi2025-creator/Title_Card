import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, logOut } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Rocket, LogOut, Trash2, Edit2, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export function AdminDashboard({ user, isAdmin }: { user: User | null, isAdmin: boolean }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [movies, setMovies] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movieData: any[] = [];
      snapshot.forEach((doc) => {
        movieData.push({ id: doc.id, ...doc.data() });
      });
      setMovies(movieData);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  if (!isAdmin || !user) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p className="text-white/60">Only the administrator can access the dashboard.</p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) return;

    setLoading(true);
    try {
      const movieData = {
        title,
        releaseYear: year || null,
        titleCardTime: time,
        totalDuration: duration || null,
        image: image || null,
        authorId: user.uid,
        authorName: user.displayName || 'Admin',
      };

      if (editingId) {
        await updateDoc(doc(db, 'movies', editingId), movieData);
        setEditingId(null);
        setActiveTab('manage');
      } else {
        await addDoc(collection(db, 'movies'), {
          ...movieData,
          createdAt: new Date().toISOString()
        });
        setActiveTab('manage');
      }
      
      // Reset form
      setTitle('');
      setYear('');
      setTime('');
      setDuration('');
      setImage(null);
    } catch (error) {
      console.error("Error saving movie:", error);
      alert("Failed to save moment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie: any) => {
    setTitle(movie.title);
    setYear(movie.releaseYear || '');
    setTime(movie.titleCardTime);
    setDuration(movie.totalDuration || '');
    setImage(movie.image || null);
    setEditingId(movie.id);
    setActiveTab('upload');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this title card?')) {
      try {
        await deleteDoc(doc(db, 'movies', id));
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete moment");
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-200 mb-2">Admin Dashboard</h2>
          <p className="text-[#8A94A6] text-lg leading-tight">Manage cinematic moments.</p>
        </div>
        <button 
          onClick={() => logOut()}
          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 mb-8 bg-[#1A1525] p-1.5 rounded-full border border-white/5 relative">
        <button
          onClick={() => {
            setActiveTab('upload');
            if (!editingId) {
              setTitle(''); setYear(''); setTime(''); setDuration(''); setImage(null);
            }
          }}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${activeTab === 'upload' ? 'text-[#0B0914]' : 'text-white/50 hover:text-white'}`}
        >
          {activeTab === 'upload' && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#00E5FF] rounded-full -z-10" />
          )}
          <Clapperboard className="w-4 h-4" />
          {editingId ? 'Edit Moment' : 'Upload New'}
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${activeTab === 'manage' ? 'text-[#0B0914]' : 'text-white/50 hover:text-white'}`}
        >
          {activeTab === 'manage' && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#00E5FF] rounded-full -z-10" />
          )}
          <Layers className="w-4 h-4" />
          Manage Feed
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'upload' ? (
          <motion.form 
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit} 
            className="space-y-8"
          >
          
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] bg-gradient-to-br from-[#2A2438] to-[#1A1525] rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden relative shadow-2xl"
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#3A4B5C] rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <Clapperboard className="w-8 h-8 text-[#00E5FF]" />
                </div>
                <span className="text-[#00E5FF] font-bold text-lg mb-1">Drop frame or browse</span>
                <span className="text-[#8A94A6] text-sm">Supports HEIF, PNG up to 50MB</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Movie Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#7A7488]/40 border-none rounded-full py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all text-lg"
                placeholder="e.g. Blade Runner 2049"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Release Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#7A7488]/40 border-none rounded-full py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all text-lg"
                  placeholder="2017"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Timestamp</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#7A7488]/40 border-none rounded-full py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all text-lg"
                  placeholder="01:42:05"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Total Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#7A7488]/40 border-none rounded-full py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all text-lg"
                placeholder="e.g. 2h 43m"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#0B0914] rounded-full font-bold text-xl shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (editingId ? 'Updating...' : 'Publishing...') : (editingId ? 'Update Moment' : 'Publish Moment')}
            {!loading && <Rocket className="w-6 h-6" />}
          </motion.button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle(''); setYear(''); setTime(''); setDuration(''); setImage(null);
                setActiveTab('manage');
              }}
              className="w-full py-3 text-white/50 hover:text-white transition-colors"
            >
              Cancel Editing
            </button>
          )}
        </motion.form>
      ) : (
        <motion.div 
          key="manage"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {movies.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-white/10">
              <p className="text-white/50">No title cards published yet.</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="space-y-4"
            >
              {movies.map((movie) => (
                <motion.div 
                  key={movie.id} 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="bg-[#1A1525] p-4 rounded-3xl border border-white/5 flex gap-4 items-center shadow-lg"
                >
                <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden shrink-0">
                  {movie.image ? (
                    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg truncate">{movie.title}</h4>
                  <p className="text-xs text-[#00E5FF] font-mono mb-1">{movie.titleCardTime}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    {movie.createdAt ? formatDistanceToNow(new Date(movie.createdAt), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => handleEdit(movie)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => handleDelete(movie.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
            </motion.div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
