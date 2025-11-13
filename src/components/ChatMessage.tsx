import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl transition-smooth animate-in fade-in slide-in-from-bottom-2",
        isUser ? "bg-gradient-primary text-primary-foreground ml-8" : "bg-card mr-8"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-smooth",
          isUser ? "bg-white/20" : "bg-gradient-secondary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p className={cn("text-xs", isUser ? "opacity-70" : "text-muted-foreground")}>
            {timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
