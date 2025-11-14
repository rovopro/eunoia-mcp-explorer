import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function HorseLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative w-full max-w-md h-16 bg-muted/30 rounded-lg overflow-hidden border border-border/40">
        {/* Race track lines */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-border/20" />
        </div>
        <div className="absolute inset-0 flex items-center mt-4">
          <div className="w-full h-px bg-border/20" />
        </div>
        
        {/* Running horse */}
        <div className="absolute inset-0 flex items-center animate-[slide-in-right_2s_ease-in-out_infinite]">
          <span className="text-4xl ml-4">🐴</span>
        </div>
      </div>
      
      <Progress value={progress} className="w-full max-w-md" />
      
      <p className="text-sm text-muted-foreground animate-pulse">
        Thinking to provide you with the best Answer Possible
      </p>
    </div>
  );
}
