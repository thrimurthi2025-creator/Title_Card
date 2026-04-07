import { MapPin, Clock } from 'lucide-react';

export function Theaters() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-secondary blur-xl opacity-20 rounded-full"></div>
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative border-2 border-foreground shadow-pop">
          <MapPin className="w-10 h-10 text-secondary" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-5xl font-heading font-extrabold text-foreground">
          Nearby Theaters
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary border-2 border-foreground text-foreground font-bold shadow-pop">
          <Clock className="w-4 h-4" strokeWidth={2.5} />
          Coming Soon
        </div>
      </div>
      
      <p className="text-muted-foreground max-w-xs leading-relaxed font-medium">
        We're working on bringing you the best local theater discovery experience. Stay tuned!
      </p>
    </div>
  );
}
