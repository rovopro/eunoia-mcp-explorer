import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash2, Database } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export interface DataSource {
  id: string;
  name: string;
  type: string;
  credentials: any;
  created_at: string;
  isEnabled: boolean;
}

interface DataSourcesDropdownProps {
  dataSources: DataSource[];
  onDataSourceDeleted: () => void;
  onEditDataSource: (source: DataSource) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

export function DataSourcesDropdown({
  dataSources,
  onDataSourceDeleted,
  onEditDataSource,
  onToggleEnabled,
}: DataSourcesDropdownProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      const existingDataSources = JSON.parse(localStorage.getItem("dataSources") || "[]");
      const updatedDataSources = existingDataSources.filter((ds: any) => ds.id !== id);
      localStorage.setItem("dataSources", JSON.stringify(updatedDataSources));

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

  const handleEdit = (e: React.MouseEvent, source: DataSource) => {
    e.stopPropagation();
    onEditDataSource(source);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "mysql":
        return "MySQL";
      case "cosmos":
        return "Cosmos DB";
      case "powerbi":
        return "Power BI";
      case "textdata":
        return "Text Data";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mysql":
        return "text-blue-500";
      case "cosmos":
        return "text-purple-500";
      case "powerbi":
        return "text-yellow-500";
      case "textdata":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Data Sources ({dataSources.length})</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-background border">
        {dataSources.map((source) => (
          <DropdownMenuItem
            key={source.id}
            className="flex items-center justify-between p-3 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Checkbox
                checked={source.isEnabled}
                onCheckedChange={(checked) => {
                  onToggleEnabled(source.id, checked as boolean);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className={`text-sm font-medium ${getTypeColor(source.type)}`}>
                {getTypeLabel(source.type)}
              </div>
              <span className="text-sm truncate">{source.name}</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleEdit(e, source)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(e, source.id)}
                disabled={deletingId === source.id}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
