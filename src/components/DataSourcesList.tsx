import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface DataSourcesListProps {
  dataSources: DataSource[];
  onDataSourceDeleted: () => void;
}

export function DataSourcesList({ dataSources, onDataSourceDeleted }: DataSourcesListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await (supabase as any)
        .from("data_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data source deleted successfully",
      });
      onDataSourceDeleted();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mysql":
        return "MySQL";
      case "cosmos":
        return "Cosmos DB";
      case "powerbi":
        return "Power BI";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mysql":
        return "bg-blue-500/10 text-blue-500";
      case "cosmos":
        return "bg-purple-500/10 text-purple-500";
      case "powerbi":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-3">
      {dataSources.map((source) => (
        <Card key={source.id} className="p-4 hover:shadow-md transition-smooth">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{source.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(source.type)}`}>
                    {getTypeLabel(source.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Added {new Date(source.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(source.id)}
                disabled={deletingId === source.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
