import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLink } from "@/components/NavLink";
import mcpLogo from "@/assets/mcp-logo.png";
import { AddDataSourceDialog } from "@/components/AddDataSourceDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
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
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center max-w-4xl">
        <div className="w-full space-y-8">
          {/* Welcome Message */}
          <div className="bg-muted/30 rounded-xl p-6 animate-fade-in">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-secondary p-1">
                <img src={mcpLogo} alt="MCP" className="h-full w-full object-contain" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm leading-relaxed">
                  Welcome to MCP Data Researcher! Get started by adding your first data source.
                </p>
              </div>
            </div>
          </div>

          {/* Add Data Source Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="gap-2 bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              <Plus className="h-5 w-5" />
              Add Data Source
            </Button>
          </div>
        </div>
      </main>

      <AddDataSourceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Index;
