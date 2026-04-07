import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, logOut, auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Rocket, LogOut, Trash2, Edit2, Layers, X, ExternalLink, Search } from 'lucide-react';
import { MovieLoader } from '../components/MovieLoader';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function AdminDashboard({ user, isAdmin }: { user: User | null, isAdmin: boolean }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [backdropImage, setBackdropImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [movies, setMovies] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Featured fields
  const [isFeatured, setIsFeatured] = useState(false);
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [description, setDescription] = useState('');
  const [fetchingInfo, setFetchingInfo] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);
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

  const fetchMovieInfo = async () => {
    if (!title) return;
    setFetchingInfo(true);
    setError(null);
    try {
      // @ts-ignore - process.env might not be defined in all environments
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in Vercel.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find information about the movie "${title}". Provide the release year, total duration (e.g. 2h 43m), IMDB rating (0-10), a brief overview (max 200 chars), and primary genre.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              year: { type: Type.STRING },
              duration: { type: Type.STRING },
              rating: { type: Type.STRING },
              description: { type: Type.STRING },
              genre: { type: Type.STRING },
            },
            required: ["year", "duration", "rating", "description", "genre"],
          },
        },
      });

      const data = JSON.parse(response.text);
      setYear(data.year || '');
      setDuration(data.duration || '');
      setRating(data.rating || '');
      setDescription(data.description || '');
      setGenre(data.genre || '');
      setIsFeatured(true);
    } catch (err) {
      console.error("Error fetching movie info:", err);
      setError("Failed to fetch movie info. Please try manually.");
    } finally {
      setFetchingInfo(false);
    }
  };

  if (!isAdmin || !user) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p className="text-white/60">Only the administrator can access the dashboard.</p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'frame' | 'poster' | 'backdrop' = 'frame') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Frame: 800x800, Poster: 600x750, Backdrop: 800x450
        const MAX_WIDTH = type === 'frame' ? 800 : type === 'poster' ? 600 : 800;
        const MAX_HEIGHT = type === 'frame' ? 800 : type === 'poster' ? 750 : 450;
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
        
        // Higher compression for multiple images to stay under 1MB doc limit
        const quality = type === 'frame' ? 0.6 : 0.4;
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        if (type === 'frame') setImage(dataUrl);
        else if (type === 'poster') setPosterImage(dataUrl);
        else if (type === 'backdrop') setBackdropImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) return;

    setLoading(true);
    setError(null);
    try {
      const movieData = {
        title,
        releaseYear: year || null,
        titleCardTime: time,
        totalDuration: duration || null,
        image: image || null,
        authorId: user.uid,
        authorName: user.email === 'akdiljith7@gmail.com' ? 'Cinephile' : (user.displayName || 'Admin'),
        isFeatured,
        genre: isFeatured ? genre : null,
        rating: isFeatured ? parseFloat(rating) || 0 : null,
        description: isFeatured ? description : null,
        posterImage: isFeatured ? posterImage : null,
        backdropImage: isFeatured ? backdropImage : null,
        posterUrl: null, // Clear old URL fields
        backdropUrl: null,
      };

      if (editingId) {
        try {
          await updateDoc(doc(db, 'movies', editingId), movieData);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `movies/${editingId}`);
        }
        setEditingId(null);
        setActiveTab('manage');
      } else {
        try {
          await addDoc(collection(db, 'movies'), {
            ...movieData,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'movies');
        }
        setActiveTab('manage');
      }
      
      // Reset form
      setTitle('');
      setYear('');
      setTime('');
      setDuration('');
      setImage(null);
      setPosterImage(null);
      setBackdropImage(null);
      setIsFeatured(false);
      setGenre('');
      setRating('');
      setDescription('');
    } catch (err: any) {
      console.error("Error saving movie:", err);
      let message = "Failed to save movie. Please check your connection.";
      try {
        if (err.message && err.message.includes('Missing or insufficient permissions')) {
          message = "Permission Denied: You don't have access to perform this action.";
        } else if (err.message && err.message.startsWith('{')) {
          const info = JSON.parse(err.message);
          if (info.error.includes('Missing or insufficient permissions')) {
            message = "Permission Denied: Your admin credentials could not be verified.";
          }
        }
      } catch (e) {}
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (movie: any) => {
    setError(null);
    setTitle(movie.title);
    setYear(movie.releaseYear || '');
    setTime(movie.titleCardTime);
    setDuration(movie.totalDuration || '');
    setImage(movie.image || null);
    setPosterImage(movie.posterImage || null);
    setBackdropImage(movie.backdropImage || null);
    setIsFeatured(movie.isFeatured || false);
    setGenre(movie.genre || '');
    setRating(movie.rating?.toString() || '');
    setDescription(movie.description || '');
    setEditingId(movie.id);
    setActiveTab('upload');
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteDoc(doc(db, 'movies', id));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting movie:", err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `movies/${id}`);
      } catch (jsonErr: any) {
        setError("Failed to delete movie: " + (jsonErr.message.includes('Missing or insufficient permissions') ? "Permission Denied" : "Server Error"));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground text-lg font-medium">Manage cinematic moments.</p>
        </div>
        <button 
          onClick={() => logOut()}
          className="p-3 bg-secondary text-white border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active rounded-full transition-all self-end sm:self-auto"
          title="Logout"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-secondary/20 border-2 border-secondary rounded-xl text-secondary font-bold text-sm flex items-center justify-between shadow-pop"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/50 rounded-full">
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-8 bg-white p-2 rounded-full border-2 border-foreground shadow-pop relative">
        <button
          onClick={() => {
            setActiveTab('upload');
            if (!editingId) {
              setTitle(''); setYear(''); setTime(''); setDuration(''); setImage(null);
            }
          }}
          className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${activeTab === 'upload' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'upload' && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-accent border-2 border-foreground shadow-pop rounded-full -z-10" />
          )}
          <Clapperboard className="w-4 h-4" strokeWidth={2.5} />
          {editingId ? 'Edit Moment' : 'Upload New'}
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-3 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 ${activeTab === 'manage' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {activeTab === 'manage' && (
            <motion.div layoutId="activeTab" className="absolute inset-0 bg-accent border-2 border-foreground shadow-pop rounded-full -z-10" />
          )}
          <Layers className="w-4 h-4" strokeWidth={2.5} />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] bg-white border-2 border-foreground rounded-[2.5rem] sm:rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:shadow-pop-hover transition-all overflow-hidden relative shadow-pop"
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-tertiary border-2 border-foreground rounded-full flex items-center justify-center mb-4 shadow-pop">
                    <Clapperboard className="w-8 h-8 text-foreground" strokeWidth={2.5} />
                  </div>
                  <span className="text-foreground font-heading font-bold text-xl mb-1">Drop frame or browse</span>
                  <span className="text-muted-foreground text-sm font-medium">Supports HEIF, PNG up to 50MB</span>
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

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-foreground shadow-pop">
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-foreground text-accent focus:ring-accent"
                />
                <label htmlFor="isFeatured" className="text-sm font-bold text-foreground cursor-pointer">
                  Feature on Home Screen
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase ml-2">Movie Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border-2 border-foreground rounded-xl py-4 px-6 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-pop transition-all text-lg font-medium"
                    placeholder="e.g. Blade Runner 2049"
                    required
                  />
                  <button
                    type="button"
                    onClick={fetchMovieInfo}
                    disabled={fetchingInfo || !title}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-tertiary border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active rounded-full transition-all disabled:opacity-50"
                    title="Auto-fill details using AI"
                  >
                    {fetchingInfo ? <MovieLoader className="w-5 h-5 text-foreground" /> : <Search className="w-5 h-5 text-foreground" strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase ml-2">Release Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-white border-2 border-foreground rounded-xl py-4 px-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-pop transition-all text-lg font-medium"
                    placeholder="2017"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase ml-2">Title card</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border-2 border-foreground rounded-xl py-4 px-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-pop transition-all text-lg font-medium"
                    placeholder="01:42:05"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase ml-2">Total Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white border-2 border-foreground rounded-xl py-4 px-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-pop transition-all text-lg font-medium"
                  placeholder="e.g. 2h 43m"
                />
              </div>
            </div>
          </div>

          {/* Featured Details */}
          {isFeatured && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Genre</label>
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-[#7A7488]/20 border-none rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        placeholder="e.g. Action, Sci-Fi"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Rating (0-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full bg-[#7A7488]/20 border-none rounded-full py-3 px-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        placeholder="8.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#7A7488]/20 border-none rounded-3xl py-4 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all min-h-[150px]"
                      placeholder="Brief movie summary..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Poster (Vertical)</label>
                    <div 
                      onClick={() => posterInputRef.current?.click()}
                      className="w-full aspect-[2/3] bg-[#7A7488]/10 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#7A7488]/20 transition-all overflow-hidden relative"
                    >
                      {posterImage ? (
                        <img src={posterImage} alt="Poster" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Layers className="w-6 h-6 text-white/20" />
                          <span className="text-[10px] text-white/40 font-bold uppercase">Upload Poster</span>
                        </div>
                      )}
                      <input type="file" ref={posterInputRef} onChange={(e) => handleImageUpload(e, 'poster')} accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-wider text-[#8A94A6] uppercase ml-2">Backdrop (Horizontal)</label>
                    <div 
                      onClick={() => backdropInputRef.current?.click()}
                      className="w-full aspect-video bg-[#7A7488]/10 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#7A7488]/20 transition-all overflow-hidden relative"
                    >
                      {backdropImage ? (
                        <img src={backdropImage} alt="Backdrop" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Rocket className="w-6 h-6 text-white/20" />
                          <span className="text-[10px] text-white/40 font-bold uppercase">Upload Backdrop</span>
                        </div>
                      )}
                      <input type="file" ref={backdropInputRef} onChange={(e) => handleImageUpload(e, 'backdrop')} accept="image/*" className="hidden" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-accent text-white border-2 border-foreground rounded-full font-heading font-extrabold text-2xl shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (editingId ? 'Updating...' : 'Publishing...') : (editingId ? 'Update Moment' : 'Publish Moment')}
              {!loading && <Rocket className="w-6 h-6" strokeWidth={2.5} />}
            </motion.button>
          </div>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle(''); setYear(''); setTime(''); setDuration(''); setImage(null);
                setActiveTab('manage');
              }}
              className="w-full py-3 text-muted-foreground hover:text-foreground font-bold transition-colors"
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
            <div className="text-center py-12 bg-white rounded-xl border-2 border-foreground shadow-pop">
              <p className="text-muted-foreground font-bold">No title cards published yet.</p>
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
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {movies.map((movie) => (
                <motion.div 
                  key={movie.id} 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="bg-white p-4 rounded-xl border-2 border-foreground flex gap-4 items-center shadow-pop hover:shadow-pop-hover transition-all"
                >
                <div className="w-20 h-20 bg-muted border-2 border-foreground rounded-lg overflow-hidden shrink-0">
                  {movie.image ? (
                    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xs">No Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading font-extrabold text-lg truncate text-foreground">{movie.title}</h4>
                    {movie.isFeatured && (
                      <span className="px-2 py-0.5 bg-accent text-white text-[8px] font-bold rounded-full border-2 border-foreground uppercase tracking-widest">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-bold mb-1">{movie.titleCardTime}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {movie.createdAt ? formatDistanceToNow(new Date(movie.createdAt), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {deletingId === movie.id ? (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleDelete(movie.id)}
                          className="p-2 bg-secondary text-white border-2 border-foreground rounded-full shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
                          title="Confirm Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="p-2 bg-white text-foreground border-2 border-foreground rounded-full shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(movie)}
                          className="p-2 bg-white text-foreground border-2 border-foreground rounded-full shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => {
                            setError(null);
                            setDeletingId(movie.id);
                          }}
                          className="p-2 bg-white text-secondary border-2 border-foreground rounded-full shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </>
                    )}
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
