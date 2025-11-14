import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import ponyLogo from "@/assets/pony-logo.png";

export function HorseLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
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
      <div className="relative w-full max-w-md">
        <Progress value={progress} className="h-3" />
        
        {/* Logo moving along progress bar */}
        <div 
          className="absolute top-0 -translate-y-1/2 transition-all duration-100"
          style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
        >
          <img src={ponyLogo} alt="Loading" className="w-8 h-8 object-contain" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground animate-pulse">
        Thinking to provide you with the best Answer Possible
      </p>
    </div>
  );
}
