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

  if (loading) return <div className="p-12 flex justify-center"><MovieLoader className="w-12 h-12" /></div>;

  return (
    <div className="p-8 max-w-lg mx-auto space-y-8 bg-[#1A1525] rounded-[2rem] border border-white/5">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img src={profile?.photoURL || user.photoURL || ''} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white/10" />
          <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full cursor-pointer hover:bg-gray-100">
            <Camera className="w-5 h-5 text-[#0B0914]" />
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
          {uploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><MovieLoader className="w-8 h-8" /></div>}
        </div>
        <h2 className="text-2xl font-bold text-white">{profile?.name || user.displayName}</h2>
        <p className="text-white/60">{profile?.email || user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/5 p-4 rounded-2xl">
          <p className="text-2xl font-bold">{stats.posts}</p>
          <p className="text-xs text-white/50 uppercase tracking-widest">Posts</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl">
          <p className="text-2xl font-bold">{stats.comments}</p>
          <p className="text-xs text-white/50 uppercase tracking-widest">Comments</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl">
          <p className="text-2xl font-bold">{stats.ratings}</p>
          <p className="text-xs text-white/50 uppercase tracking-widest">Ratings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Bio</h3>
          {!isEditingBio && <button onClick={() => setIsEditingBio(true)} className="text-pink-500"><Edit2 className="w-4 h-4" /></button>}
        </div>
        {isEditingBio ? (
          <div className="space-y-2">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-pink-500"
              rows={4}
            />
            <div className="flex gap-2">
              <button onClick={handleUpdateBio} className="flex-1 bg-pink-500 text-white py-2 rounded-xl font-bold">Save</button>
              <button onClick={() => setIsEditingBio(false)} className="flex-1 bg-white/10 text-white py-2 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-white/80 bg-white/5 p-4 rounded-2xl min-h-[100px]">{bio || 'No bio yet.'}</p>
        )}
      </div>

      <button onClick={logOut} className="w-full bg-red-500/10 text-red-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
