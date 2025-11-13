import { HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoldenQuestionsDropdownProps {
  onSelect: (question: string) => void;
}

const goldenQuestions = [
  "What are the total sales for last quarter?",
  "Which products have the highest inventory turnover?",
  "Show me customer purchase patterns by category",
  "What are the top performing suppliers?",
  "Analyze revenue trends across all data sources",
];

export function GoldenQuestionsDropdown({ onSelect }: GoldenQuestionsDropdownProps) {
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-[240px] bg-card hover:bg-muted transition-smooth">
        <HelpCircle className="h-4 w-4 mr-2 text-primary" />
        <SelectValue placeholder="Quick questions" />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {goldenQuestions.map((question, index) => (
          <SelectItem
            key={index}
            value={question}
            className="cursor-pointer hover:bg-muted transition-smooth"
          >
            {question}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
