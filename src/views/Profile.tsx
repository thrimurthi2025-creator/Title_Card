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
    <div className="p-8 max-w-lg mx-auto space-y-8 bg-white rounded-xl border-2 border-foreground shadow-pop mt-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img src={profile?.photoURL || user.photoURL || ''} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-foreground shadow-pop" />
          <label className="absolute bottom-0 right-0 p-2 bg-accent rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-foreground shadow-pop">
            <Camera className="w-5 h-5 text-white" strokeWidth={2.5} />
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
          {uploading && <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center"><MovieLoader className="w-8 h-8 text-accent" /></div>}
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-foreground">{profile?.name || user.displayName}</h2>
        <p className="text-muted-foreground font-bold">{profile?.email || user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-tertiary p-4 rounded-xl border-2 border-foreground shadow-pop">
          <p className="text-2xl font-heading font-extrabold text-foreground">{stats.posts}</p>
          <p className="text-xs text-foreground uppercase tracking-widest font-bold">Posts</p>
        </div>
        <div className="bg-quaternary p-4 rounded-xl border-2 border-foreground shadow-pop">
          <p className="text-2xl font-heading font-extrabold text-foreground">{stats.comments}</p>
          <p className="text-xs text-foreground uppercase tracking-widest font-bold">Comments</p>
        </div>
        <div className="bg-secondary p-4 rounded-xl border-2 border-foreground shadow-pop">
          <p className="text-2xl font-heading font-extrabold text-white">{stats.ratings}</p>
          <p className="text-xs text-white uppercase tracking-widest font-bold">Ratings</p>
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
  );
}
