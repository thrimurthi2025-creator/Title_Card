import React from 'react';
import { motion } from 'motion/react';
import { Clapperboard, MessageSquare, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MovieEntry } from '../views/Feed';

interface MovieCardProps {
  movie: MovieEntry;
  onSelectMovie: (movie: MovieEntry) => void;
  setActiveMovieId: (id: string | null) => void;
  navigate: (path: string) => void;
  downloadImage: (url: string, filename: string) => void;
}

export const MovieCard = React.memo(({ movie, onSelectMovie, setActiveMovieId, navigate, downloadImage }: MovieCardProps) => {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="bg-white rounded-xl p-5 border-2 border-foreground shadow-pop hover:shadow-pop-hover transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-foreground font-bold text-sm overflow-hidden shadow-pop border-2 border-foreground">
            {movie.authorName.toLowerCase().includes('diljith') || movie.authorName.toLowerCase().includes('cinephile') || movie.authorName.toLowerCase() === 'admin' ? (
              <Clapperboard className="w-5 h-5 text-foreground" strokeWidth={2.5} />
            ) : (
              movie.authorName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">@{movie.authorName.toLowerCase().includes('diljith') || movie.authorName.toLowerCase().includes('cinephile') || movie.authorName.toLowerCase() === 'admin' ? 'cinephile' : movie.authorName.toLowerCase().replace(/\s+/g, '_')}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              {formatDistanceToNow(new Date(movie.createdAt)).toUpperCase()} AGO
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            onSelectMovie(movie);
            navigate('/tracker');
          }}
          className="p-2 bg-accent text-white rounded-full border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all"
        >
          <Clapperboard className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => setActiveMovieId(movie.id)}
          className="p-2 bg-white rounded-full border-2 border-transparent hover:border-foreground hover:shadow-pop active:shadow-pop-active transition-all"
        >
          <MessageSquare className="w-5 h-5 text-foreground" strokeWidth={2.5} />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-muted mb-5 cursor-pointer border-2 border-foreground" onClick={() => navigate(`/movie/${movie.id}`)}>
        {movie.image ? (
          <>
            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(movie.image!, `${movie.title}.jpg`);
              }}
              className="absolute top-2 right-2 p-2 bg-white border-2 border-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-pop hover:shadow-pop-hover active:shadow-pop-active"
            >
              <Download className="w-5 h-5 text-foreground" strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">No Image</div>
        )}
      </div>

      {/* Details */}
      <div onClick={() => navigate(`/movie/${movie.id}`)} className="cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-heading font-extrabold uppercase tracking-wide text-foreground">{movie.title}</h3>
          {movie.releaseYear && (
            <span className="px-3 py-1 bg-white text-foreground text-xs font-bold rounded-full border-2 border-foreground shadow-pop">
              {movie.releaseYear}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground leading-relaxed mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title card at</span>
            <span className="bg-accent text-white px-3 py-1 rounded-full font-black text-base shadow-pop border-2 border-foreground">
              {movie.titleCardTime}
            </span>
          </div>
          {movie.totalDuration && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</span>
              <span className="text-foreground font-bold bg-white px-2 py-0.5 rounded-full border-2 border-foreground">{movie.totalDuration}</span>
            </div>
          )}
        </div>
        {movie.description && (
          <p className="text-sm text-foreground/80 mb-3 line-clamp-2">{movie.description}</p>
        )}
        {movie.whySpecial && (
          <div className="bg-muted p-3 rounded-lg border border-foreground/10">
            <p className="text-xs font-bold text-accent mb-1">Why this title card is special:</p>
            <p className="text-xs text-foreground/70 line-clamp-2">{movie.whySpecial}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});
