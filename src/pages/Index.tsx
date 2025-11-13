import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLink } from "@/components/NavLink";
import mcpLogo from "@/assets/mcp-logo.png";
import { AddDataSourceDialog } from "@/components/AddDataSourceDialog";
import { DataSourcesList } from "@/components/DataSourcesList";
import { ChatInterface } from "@/components/ChatInterface";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchDataSources();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchDataSources();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDataSources = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("data_sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDataSources(data || []);
    } catch (error: any) {
      console.error("Error fetching data sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const handleDataSourceAdded = () => {
    setDialogOpen(false);
    fetchDataSources();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="w-full space-y-6">
          {/* Data Sources Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Data Sources</h2>
                <p className="text-muted-foreground">Manage your connected data sources</p>
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
              >
                <Plus className="h-4 w-4" />
                Add Data Source
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : dataSources.length === 0 ? (
              <div className="bg-muted/30 rounded-xl p-8 text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-secondary p-2">
                    <img src={mcpLogo} alt="MCP" className="h-full w-full object-contain" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No data sources yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first data source
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
                >
                  <Plus className="h-4 w-4" />
                  Add Data Source
                </Button>
              </div>
            ) : (
              <DataSourcesList
                dataSources={dataSources}
                onDataSourceDeleted={fetchDataSources}
              />
            )}
          </div>

          {/* Chat Interface - Only show if there are data sources */}
          {dataSources.length > 0 && (
            <div className="animate-fade-in">
              <ChatInterface />
            </div>
          )}
        </div>
      </main>

      <AddDataSourceDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default Index;
