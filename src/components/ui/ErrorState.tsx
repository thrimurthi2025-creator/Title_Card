import { RefreshCw } from 'lucide-react';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white border-2 border-foreground rounded-2xl shadow-pop">
      <p className="text-foreground font-bold text-lg">Something went wrong 😬</p>
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full font-bold border-2 border-foreground shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}
