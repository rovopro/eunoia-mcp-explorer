import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatMessage } from "@/components/ChatMessage";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { GoldenQuestionsDropdown } from "@/components/GoldenQuestionsDropdown";
import { FileUploadButton } from "@/components/FileUploadButton";
import { NavLink } from "@/components/NavLink";
import eunoiaLogo from "@/assets/eunoia-logo-dark.webp";
import mcpLogo from "@/assets/mcp-logo.png";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm MCP (My Cute Pony) Data Researcher. I can help you discover insights across multiple data sources including MySQL EPOS Database, Power BI models, and Cosmos NoSQL. Ask me anything or select a quick question to get started!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [dataSource, setDataSource] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate MCP processing
    setTimeout(() => {
      const responseContent = generateMockResponse(input, dataSource, attachedFile);
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      setAttachedFile(null);
    }, 1500);
  };

  const generateMockResponse = (query: string, source: string, file: File | null): string => {
    const sourceText = source === "all" ? "all data sources" : source.toUpperCase();
    let response = `I've analyzed your query across ${sourceText}.\n\n`;

    if (file) {
      response += `📎 File "${file.name}" has been processed.\n\n`;
    }

    response += `Based on the MCP integration layer:\n\n`;
    response += `🔍 **Data Discovery**: Found relevant schemas across ${source === "all" ? 3 : 1} data source(s)\n`;
    response += `📊 **Query Execution**: Retrieved and structured data from connected systems\n`;
    response += `💡 **Insights**: `;

    if (query.toLowerCase().includes("sales")) {
      response += "Total sales for Q4 2024: $2.4M (15% increase YoY)\nTop category: Electronics with $890K in revenue";
    } else if (query.toLowerCase().includes("inventory")) {
      response += "45 products require reordering\nAverage inventory turnover: 6.2 times per quarter";
    } else if (query.toLowerCase().includes("customer")) {
      response += "Active customers: 1,247\nAverage purchase frequency: 3.8 times per month\nTop segment: Premium tier (42% of revenue)";
    } else if (query.toLowerCase().includes("supplier")) {
      response += "Top 3 suppliers by reliability: TechCorp (98%), FastShip Ltd (96%), GlobalParts (94%)";
    } else {
      response += `Successfully processed your query. The data shows interesting patterns across ${sourceText}.`;
    }

    return response;
  };

  const handleQuestionSelect = (question: string) => {
    setInput(question);
    toast({
      title: "Question selected",
      description: "Press Send to execute the query",
    });
  };

  const handleFileSelect = (file: File) => {
    setAttachedFile(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={eunoiaLogo} alt="Eunoia" className="h-8" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">MCP Data Researcher</h1>
              <p className="text-xs text-muted-foreground">My Cute Pony - Powered by Model Context Protocol</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/faq">FAQ</NavLink>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        {/* Welcome Section (shows when no messages) */}
        {messages.length === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 mb-8 animate-fade-in">
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img src={mcpLogo} alt="MCP Logo" className="h-32 w-32 relative animate-pulse" />
            </div>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome to MCP Data Researcher
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Ask questions across multiple data sources. I'll discover, query, and present insights from MySQL,
                Power BI, Cosmos DB, and more.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} {...message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-xl bg-card mr-8 animate-in fade-in">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-secondary">
                  <Sparkles className="h-4 w-4 text-secondary-foreground animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Thinking and Gathering Data for the best possible Answer...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="mt-6 space-y-3">
          {/* Controls Row */}
          <div className="flex flex-wrap gap-2 items-center">
            <DataSourceSelector value={dataSource} onChange={setDataSource} />
            <GoldenQuestionsDropdown onSelect={handleQuestionSelect} />
            {attachedFile && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
                <span className="text-muted-foreground">📎 {attachedFile.name}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="flex gap-2 items-end bg-card rounded-xl p-2 shadow-lg border border-border">
            <FileUploadButton onFileSelect={handleFileSelect} />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="rounded-full h-10 w-10 p-0 bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            MCP connects to MySQL EPOS, Power BI, and Cosmos NoSQL databases
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
