import { Plus, Star, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Chat {
  id: string;
  name: string;
  createdAt: string;
  isFavorite: boolean;
  messages: any[];
}

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onUpdateChat: (chatId: string, updates: Partial<Chat>) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onUpdateChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditName(chat.name);
  };

  const handleSaveEdit = (chatId: string) => {
    if (editName.trim()) {
      onUpdateChat(chatId, { name: editName.trim() });
      setEditingId(null);
      toast({
        title: "Chat renamed",
        description: "Chat name updated successfully",
      });
    }
  };

  const formatChatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleToggleFavorite = (chat: Chat) => {
    onUpdateChat(chat.id, { isFavorite: !chat.isFavorite });
  };

  const handleDelete = (chatId: string) => {
    onDeleteChat(chatId);
    toast({
      title: "Chat deleted",
      description: "Chat removed successfully",
    });
  };

  // Sort chats: favorites first, then by date
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-border bg-card/50 flex flex-col h-full relative">
        {/* Show panel button - same position as hide button */}
        <div className="absolute bottom-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8 hover:bg-muted rounded-full shadow-md"
            title="Show panel"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-full relative">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1 pb-16">
          {sortedChats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-smooth hover:bg-muted/50 ${
                currentChatId === chat.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              {editingId === chat.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleSaveEdit(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(chat.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 text-sm"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(chat);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-muted rounded transition-smooth"
                    >
                      <Star
                        className={`h-4 w-4 transition-smooth ${
                          chat.isFavorite
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatChatDate(chat.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-smooth flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(chat);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {chats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No chats yet. Create one to get started!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Hide panel button */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8 hover:bg-muted rounded-full shadow-md"
          title="Hide panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
