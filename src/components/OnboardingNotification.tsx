import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingNotificationProps {
  message: string;
  onDismiss: () => void;
}

export const OnboardingNotification = ({ message, onDismiss }: OnboardingNotificationProps) => {
  return (
    <div className="w-full flex justify-center animate-fade-in mb-4">
      <div className="flex gap-3 p-4 rounded-xl bg-gradient-secondary shadow-elegant border border-border/50 max-w-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
