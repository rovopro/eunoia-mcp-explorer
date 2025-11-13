import { Database, Server, Cloud, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const dataSources = [
  { value: "all", label: "All Data Sources", icon: Layers },
  { value: "mysql", label: "MySQL EPOS Database", icon: Database },
  { value: "powerbi", label: "Power BI", icon: Server },
  { value: "cosmos", label: "Cosmos NoSQL", icon: Cloud },
];

export function DataSourceSelector({ value, onChange }: DataSourceSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[240px] bg-card hover:bg-muted transition-smooth">
        <SelectValue placeholder="Select data source" />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {dataSources.map((source) => {
          const Icon = source.icon;
          return (
            <SelectItem
              key={source.value}
              value={source.value}
              className="cursor-pointer hover:bg-muted transition-smooth"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <span>{source.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
