import { MapPin, Clock } from 'lucide-react';

export function Theaters() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 blur-2xl opacity-50 rounded-full"></div>
        <div className="w-24 h-24 bg-gradient-to-br from-[#2A2438] to-[#1A1525] rounded-full flex items-center justify-center relative border border-white/10 shadow-xl">
          <MapPin className="w-10 h-10 text-pink-400" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          Nearby Theaters
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 font-medium">
          <Clock className="w-4 h-4 text-indigo-400" />
          Coming Soon
        </div>
      </div>
      
      <p className="text-white/50 max-w-xs leading-relaxed">
        We're working on bringing you the best local theater discovery experience. Stay tuned!
      </p>
    </div>
  );
}
