import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import ponyLogo from "@/assets/pony-logo.png";
import { ChartMessage } from "./ChartMessage";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  chartData?: {
    type: "bar" | "line" | "pie";
    data: any[];
    title?: string;
  };
}

export function ChatMessage({ role, content, timestamp, chartData }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl transition-smooth animate-fade-in",
        isUser ? "bg-gradient-primary text-primary-foreground ml-8" : "bg-muted/30 mr-8"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-smooth",
          isUser ? "bg-white/20" : "bg-gradient-secondary p-1"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <img src={ponyLogo} alt="Pony" className="h-full w-full object-contain" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {chartData && <ChartMessage {...chartData} />}
        {timestamp && (
          <p className={cn("text-xs", isUser ? "opacity-70" : "text-muted-foreground")}>
            {timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
