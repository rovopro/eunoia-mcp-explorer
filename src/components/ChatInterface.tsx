import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { FileUploadButton } from "@/components/FileUploadButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HorseLoader } from "@/components/HorseLoader";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatId: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onUpdateMessages: (messages: Message[]) => void;
}

export function ChatInterface({ chatId, messages, onSendMessage, onUpdateMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    let messageContent = input;
    if (attachedFile) {
      messageContent = `${input}\n[Attached file: ${attachedFile.name}]`;
    }

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateMessages(newMessages);
    onSendMessage(messageContent);
    
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    // Simulate AI response - Replace this with actual Azure AI Foundry integration
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "This is a placeholder response. Azure AI Foundry integration will be added later.",
        timestamp: new Date(),
      };
      onUpdateMessages([...newMessages, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-xl bg-card">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-sm text-muted-foreground">Ask questions about your data</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && <HorseLoader />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2 items-end">
          <div className="flex items-end gap-2 flex-1">
            <FileUploadButton onFileSelect={setAttachedFile} />
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="min-h-[80px] resize-none flex-1"
            />
          </div>
          <Button 
            onClick={handleSend} 
            disabled={(!input.trim() && !attachedFile) || isLoading}
            className="gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
        {attachedFile && (
          <div className="text-sm text-muted-foreground mt-2">
            Attached: {attachedFile.name}
          </div>
        )}
      </div>
    </div>
  );
}
