import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLink } from "@/components/NavLink";
import mcpLogo from "@/assets/mcp-logo.png";
import { AddDataSourceDialog } from "@/components/AddDataSourceDialog";
import { DataSourcesDropdown, DataSource } from "@/components/DataSourcesDropdown";
import { ChatInterface } from "@/components/ChatInterface";
import { ChatSidebar, Chat } from "@/components/ChatSidebar";

const Index = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchDataSources();
    fetchChats();
  }, []);

  const fetchDataSources = () => {
    try {
      const storedDataSources = JSON.parse(localStorage.getItem("dataSources") || "[]");
      setDataSources(storedDataSources);
    } catch (error: any) {
      console.error("Error fetching data sources:", error);
    }
  };

  const fetchChats = () => {
    try {
      const storedChats = JSON.parse(localStorage.getItem("chats") || "[]");
      setChats(storedChats);
      if (storedChats.length > 0 && !currentChatId) {
        setCurrentChatId(storedChats[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching chats:", error);
    }
  };

  const saveChats = (updatedChats: Chat[]) => {
    localStorage.setItem("chats", JSON.stringify(updatedChats));
    setChats(updatedChats);
  };

  const handleLogout = () => {
    // Logout functionality will be implemented later
    localStorage.clear();
    navigate("/auth");
  };

  const handleDataSourceAdded = () => {
    setDialogOpen(false);
    setEditingSource(null);
    fetchDataSources();
  };

  const handleEditDataSource = (source: DataSource) => {
    setEditingSource(source);
    setDialogOpen(true);
  };

  const handleToggleDataSource = (id: string, enabled: boolean) => {
    const updatedDataSources = dataSources.map(ds =>
      ds.id === id ? { ...ds, isEnabled: enabled } : ds
    );
    localStorage.setItem("dataSources", JSON.stringify(updatedDataSources));
    setDataSources(updatedDataSources);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      name: `Chat ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      messages: [],
    };
    const updatedChats = [newChat, ...chats];
    saveChats(updatedChats);
    setCurrentChatId(newChat.id);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleUpdateChat = (chatId: string, updates: Partial<Chat>) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, ...updates } : chat
    );
    saveChats(updatedChats);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    saveChats(updatedChats);
    if (currentChatId === chatId && updatedChats.length > 0) {
      setCurrentChatId(updatedChats[0].id);
    } else if (updatedChats.length === 0) {
      setCurrentChatId(null);
    }
  };

  const handleSendMessage = (message: string) => {
    // This will be handled by ChatInterface
  };

  const handleUpdateMessages = (messages: any[]) => {
    if (!currentChatId) return;
    const updatedChats = chats.map(chat =>
      chat.id === currentChatId ? { ...chat, messages } : chat
    );
    saveChats(updatedChats);
  };

  const currentChat = chats.find(chat => chat.id === currentChatId);

  

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={mcpLogo} alt="MCP Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MCP Data Researcher
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        {dataSources.length > 0 && (
          <ChatSidebar
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onUpdateChat={handleUpdateChat}
            onDeleteChat={handleDeleteChat}
          />
        )}

        <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl overflow-auto">
          <div className="w-full space-y-6">
          {/* Data Sources Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              {dataSources.length > 0 ? (
                <div className="flex-1 max-w-md">
                  <DataSourcesDropdown
                    dataSources={dataSources}
                    onDataSourceDeleted={fetchDataSources}
                    onEditDataSource={handleEditDataSource}
                    onToggleEnabled={handleToggleDataSource}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">Data Sources</h2>
                  <p className="text-muted-foreground">Get started by adding your first data source</p>
                </div>
              )}
              <Button
                onClick={() => {
                  setEditingSource(null);
                  setDialogOpen(true);
                }}
                className="gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                <Plus className="h-4 w-4" />
                Add Data Source
              </Button>
            </div>

            {!loading && dataSources.length === 0 && (
              <div className="bg-muted/30 rounded-xl p-8 text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-secondary p-2">
                    <img src={mcpLogo} alt="MCP" className="h-full w-full object-contain" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No data sources yet</h3>
                <p className="text-muted-foreground">
                  Click the button above to add your first data source
                </p>
              </div>
            )}
          </div>

            {/* Chat Interface - Only show if there are data sources and a current chat */}
            {dataSources.length > 0 && currentChat && (
              <div className="animate-fade-in">
                <ChatInterface
                  chatId={currentChat.id}
                  messages={currentChat.messages}
                  onSendMessage={handleSendMessage}
                  onUpdateMessages={handleUpdateMessages}
                />
              </div>
            )}

            {dataSources.length > 0 && !currentChat && (
              <div className="bg-muted/30 rounded-xl p-8 text-center animate-fade-in">
                <h3 className="text-lg font-medium mb-2">No chat selected</h3>
                <p className="text-muted-foreground">
                  Create a new chat to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddDataSourceDialog
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingSource(null);
        }}
        editingSource={editingSource}
        onSaved={handleDataSourceAdded}
      />
    </div>
  );
};

export default Index;
