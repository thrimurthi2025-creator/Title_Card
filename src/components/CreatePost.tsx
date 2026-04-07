import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User } from 'firebase/auth';
import { Image as ImageIcon, Video, Send } from 'lucide-react';
import { MovieLoader } from './MovieLoader';

export function CreatePost({ user }: { user: User }) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !file) return;
    setIsPosting(true);
    try {
      let mediaUrl = '';
      let mediaType = '';
      if (file) {
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}`);
        await uploadBytes(storageRef, file);
        mediaUrl = await getDownloadURL(storageRef);
        mediaType = file.type.startsWith('video') ? 'video' : 'image';
      }
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        caption: content,
        image: mediaUrl,
        createdAt: serverTimestamp(),
        likesCount: 0
      });
      setContent('');
      setFile(null);
    } catch (error) {
      console.error("Error posting:", error);
    }
    setIsPosting(false);
  };

  return (
    <div className="bg-[#1A1525] p-6 rounded-[2rem] border border-white/5 space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your movie experience..."
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-pink-500"
        rows={3}
      />
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <label className="p-2 bg-white/5 rounded-full cursor-pointer hover:bg-white/10">
            <ImageIcon className="w-5 h-5 text-pink-500" />
            <input type="file" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} accept="image/*" />
          </label>
          <label className="p-2 bg-white/5 rounded-full cursor-pointer hover:bg-white/10">
            <Video className="w-5 h-5 text-violet-500" />
            <input type="file" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} accept="video/*" />
          </label>
          {file && <span className="text-xs text-white/50 self-center">{file.name}</span>}
        </div>
        <button 
          onClick={handlePost} 
          disabled={isPosting || (!content.trim() && !file)}
          className="px-6 py-2 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-all disabled:opacity-50"
        >
          {isPosting ? <MovieLoader className="w-5 h-5" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
