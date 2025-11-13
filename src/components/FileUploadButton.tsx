import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
}

export function FileUploadButton({ onFileSelect }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 20MB",
          variant: "destructive",
        });
        return;
      }
      onFileSelect(file);
      toast({
        title: "File attached",
        description: `${file.name} (${(file.size / 1024).toFixed(2)}KB)`,
      });
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.json,.xlsx,.xls,.pdf,.txt"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-full hover:bg-muted transition-smooth"
      >
        <Paperclip className="h-5 w-5" />
        <span className="sr-only">Attach file</span>
      </Button>
    </>
  );
}
