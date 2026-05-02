import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getCountFromServer, collectionGroup } from 'firebase/firestore';
import { db, storage, logOut } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MovieLoader } from '../components/MovieLoader';
import { Camera, Save, Edit2, LogOut } from 'lucide-react';

export function Profile({ user }: { user: User }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ posts: 0, comments: 0, ratings: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setBio(data.bio || '');
        }

        // Fetch stats
        const postsCount = await getCountFromServer(query(collection(db, 'movies'), where('authorId', '==', user.uid)));
        const ratingsCount = await getCountFromServer(query(collection(db, 'ratings'), where('userId', '==', user.uid)));
        const commentsCount = await getCountFromServer(query(collectionGroup(db, 'comments'), where('userId', '==', user.uid)));
        
        setStats({
          posts: postsCount.data().count,
          comments: commentsCount.data().count,
          ratings: ratingsCount.data().count
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users/' + user.uid);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user.uid]);

  const handleUpdateBio = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { bio });
      setIsEditingBio(false);
      alert('Bio updated!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + user.uid);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `profiles/${user.uid}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', user.uid), { photoURL });
    setProfile({ ...profile, photoURL });
    setUploading(false);
  };

  if (loading) return <div className="p-12 flex justify-center"><MovieLoader className="w-12 h-12 text-accent" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 bg-white rounded-[2.5rem] border-2 border-foreground shadow-pop mt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/20 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 blur-3xl"></div>
      
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
        <div className="flex flex-col items-center gap-6 shrink-0">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-foreground shadow-pop relative z-10">
              <img src={profile?.photoURL || user.photoURL || ''} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <label className="absolute bottom-2 right-2 z-20 p-4 bg-accent rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-all border-2 border-foreground shadow-pop group-hover:rotate-12">
              <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            {uploading && (
              <div className="absolute inset-0 z-30 bg-background/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MovieLoader className="w-10 h-10 text-accent" />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-4xl font-heading font-extrabold text-foreground tracking-tight leading-none mb-2">{profile?.name || user.displayName}</h2>
            <p className="text-muted-foreground font-bold tracking-tight">{profile?.email || user.email}</p>
          </div>
        </div>

        <div className="flex-1 w-full space-y-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-tertiary p-6 rounded-2xl border-2 border-foreground shadow-pop group hover:-translate-y-1 transition-transform">
              <p className="text-4xl font-heading font-extrabold text-foreground mb-1">{stats.posts}</p>
              <p className="text-[10px] text-foreground uppercase tracking-widest font-black opacity-60">Posts</p>
            </div>
            <div className="bg-quaternary p-6 rounded-2xl border-2 border-foreground shadow-pop group hover:-translate-y-1 transition-transform">
              <p className="text-4xl font-heading font-extrabold text-foreground mb-1">{stats.comments}</p>
              <p className="text-[10px] text-foreground uppercase tracking-widest font-black opacity-60">Comments</p>
            </div>
            <div className="bg-secondary p-6 rounded-2xl border-2 border-foreground shadow-pop group hover:-translate-y-1 transition-transform">
              <p className="text-4xl font-heading font-extrabold text-white mb-1">{stats.ratings}</p>
              <p className="text-[10px] text-white uppercase tracking-widest font-black opacity-60">Ratings</p>
            </div>
          </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-xl text-foreground">Bio</h3>
          {!isEditingBio && <button onClick={() => setIsEditingBio(true)} className="text-accent hover:text-foreground transition-colors"><Edit2 className="w-5 h-5" strokeWidth={2.5} /></button>}
        </div>
        {isEditingBio ? (
          <div className="space-y-2">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white border-2 border-foreground rounded-xl p-4 text-foreground outline-none focus:border-accent focus:shadow-pop transition-all font-medium"
              rows={4}
            />
            <div className="flex gap-2">
              <button onClick={handleUpdateBio} className="flex-1 bg-accent text-white py-3 rounded-full font-bold border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all">Save</button>
              <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-white text-foreground py-3 rounded-full font-bold border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-foreground font-medium bg-muted p-4 rounded-xl min-h-[100px] border-2 border-foreground">{bio || 'No bio yet.'}</p>
        )}
      </div>

      <button onClick={logOut} className="w-full bg-secondary text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all">
        <LogOut className="w-5 h-5" strokeWidth={2.5} />
        Logout
      </button>
      </div>
      </div>
    </div>
  );
}
